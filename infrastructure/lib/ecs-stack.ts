import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

export interface EcsStackProps extends cdk.StackProps {
  appsyncUrl: string;
  appsyncApiKey: string;
  nextauthSecret: string;
  redditClientId: string;
  redditClientSecret: string;
  googleClientId: string;
  googleClientSecret: string;
}

export class EcsStack extends cdk.Stack {
  public readonly loadBalancerUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: EcsStackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'RedditVpc', {
      maxAzs: 2,
      natGateways: 1,
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'RedditCluster', {
      vpc,
      clusterName: 'reddit-clone-cluster',
      containerInsights: true,
    });

    // Task Definition
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'RedditTaskDef', {
      memoryLimitMiB: 2048,
      cpu: 1024,
    });

    // Container
    const container = taskDefinition.addContainer('RedditContainer', {
      image: ecs.ContainerImage.fromAsset('..', {
        file: 'Dockerfile',
        exclude: ['infrastructure', 'e2e', 'node_modules', '.git', '.next', 'playwright-report'],
      }),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'reddit-clone',
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
      environment: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_APPSYNC_URL: props.appsyncUrl,
        NEXT_PUBLIC_APPSYNC_API_KEY: props.appsyncApiKey,
        NEXTAUTH_SECRET: props.nextauthSecret,
        REDDIT_CLIENT_ID: props.redditClientId,
        REDDIT_CLIENT_SECRET: props.redditClientSecret,
        GOOGLE_CLIENT_ID: props.googleClientId,
        GOOGLE_CLIENT_SECRET: props.googleClientSecret,
      },
    });

    container.addPortMappings({
      containerPort: 3000,
      protocol: ecs.Protocol.TCP,
    });

    // Fargate Service
    const service = new ecs.FargateService(this, 'RedditService', {
      cluster,
      taskDefinition,
      desiredCount: 1,
      assignPublicIp: true,
      serviceName: 'reddit-clone-service',
    });

    // Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, 'RedditALB', {
      vpc,
      internetFacing: true,
      loadBalancerName: 'reddit-clone-alb',
    });

    const listener = alb.addListener('HttpListener', {
      port: 80,
      open: true,
    });

    listener.addTargets('RedditTarget', {
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [service],
      healthCheck: {
        path: '/',
        interval: cdk.Duration.seconds(60),
        timeout: cdk.Duration.seconds(5),
        healthyThresholdCount: 2,
        unhealthyThresholdCount: 3,
      },
    });

    // Auto Scaling
    const scaling = service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 4,
    });

    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
    });

    // Outputs
    this.loadBalancerUrl = new cdk.CfnOutput(this, 'LoadBalancerURL', {
      value: `http://${alb.loadBalancerDnsName}`,
      description: 'Application Load Balancer URL',
      exportName: 'RedditCloneURL',
    });

    new cdk.CfnOutput(this, 'ClusterName', {
      value: cluster.clusterName,
      description: 'ECS Cluster Name',
    });
  }
}
