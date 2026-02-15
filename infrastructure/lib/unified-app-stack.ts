import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import { Construct } from 'constructs';

interface UnifiedAppStackProps extends cdk.StackProps {
  appsyncUrl: string;
  appsyncApiKey: string;
  nextauthSecret: string;
  redditClientId: string;
  redditClientSecret: string;
  googleClientId: string;
  googleClientSecret: string;
  domainName?: string;
}

export class UnifiedAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: UnifiedAppStackProps) {
    super(scope, id, props);

    // Shared VPC
    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 1,
    });

    // Shared ECS Cluster
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      clusterName: 'unified-cluster',
      containerInsights: true,
    });

    // Shared ALB
    const alb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true,
      loadBalancerName: 'unified-alb',
    });

    const listener = alb.addListener('HttpListener', {
      port: 80,
    });

    // Portfolio Service
    const portfolioTask = new ecs.FargateTaskDefinition(this, 'PortfolioTask', {
      memoryLimitMiB: 1024,
      cpu: 512,
    });

    portfolioTask.addContainer('PortfolioContainer', {
      image: ecs.ContainerImage.fromAsset('../../portfolio', {
        exclude: ['infrastructure', 'node_modules', '.git'],
      }),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'portfolio',
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
      portMappings: [{ containerPort: 3000 }],
    });

    const portfolioService = new ecs.FargateService(this, 'PortfolioService', {
      cluster,
      taskDefinition: portfolioTask,
      desiredCount: 1,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    });

    const portfolioTG = new elbv2.ApplicationTargetGroup(this, 'PortfolioTG', {
      vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: { path: '/' },
    });

    portfolioTG.addTarget(portfolioService);

    // Reddit Service
    const redditTask = new ecs.FargateTaskDefinition(this, 'RedditTask', {
      memoryLimitMiB: 2048,
      cpu: 1024,
    });

    redditTask.addContainer('RedditContainer', {
      image: ecs.ContainerImage.fromAsset('..', {
        exclude: ['infrastructure', 'node_modules', '.git'],
      }),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'reddit',
        logRetention: logs.RetentionDays.ONE_WEEK,
      }),
      portMappings: [{ containerPort: 3000 }],
      environment: {
        NEXT_PUBLIC_APPSYNC_URL: props.appsyncUrl,
        NEXT_PUBLIC_APPSYNC_API_KEY: props.appsyncApiKey,
        NEXTAUTH_SECRET: props.nextauthSecret,
        REDDIT_CLIENT_ID: props.redditClientId,
        REDDIT_CLIENT_SECRET: props.redditClientSecret,
        GOOGLE_CLIENT_ID: props.googleClientId,
        GOOGLE_CLIENT_SECRET: props.googleClientSecret,
        NEXTAUTH_URL: props.domainName
          ? `https://${props.domainName}/projects/reddit`
          : `http://${alb.loadBalancerDnsName}/projects/reddit`,
      },
    });

    const redditService = new ecs.FargateService(this, 'RedditService', {
      cluster,
      taskDefinition: redditTask,
      desiredCount: 1,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    });

    const redditTG = new elbv2.ApplicationTargetGroup(this, 'RedditTG', {
      vpc,
      port: 3000,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      healthCheck: { path: '/' },
    });

    redditTG.addTarget(redditService);

    // ALB Routing
    listener.addAction('RedditRoute', {
      priority: 1,
      conditions: [elbv2.ListenerCondition.pathPatterns(['/projects/reddit*'])],
      action: elbv2.ListenerAction.forward([redditTG]),
    });

    listener.addAction('DefaultRoute', {
      action: elbv2.ListenerAction.forward([portfolioTG]),
    });

    // CloudFront + Domain (if provided)
    if (props.domainName) {
      const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
        domainName: props.domainName,
      });

      const certificate = new acm.Certificate(this, 'Certificate', {
        domainName: props.domainName,
        validation: acm.CertificateValidation.fromDns(hostedZone),
      });

      const distribution = new cloudfront.Distribution(this, 'Distribution', {
        certificate,
        domainNames: [props.domainName],
        defaultBehavior: {
          origin: new origins.HttpOrigin(alb.loadBalancerDnsName),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
        },
      });

      new route53.ARecord(this, 'AliasRecord', {
        zone: hostedZone,
        target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      });

      new cdk.CfnOutput(this, 'CustomDomain', {
        value: `https://${props.domainName}`,
      });
    }

    new cdk.CfnOutput(this, 'LoadBalancerUrl', {
      value: `http://${alb.loadBalancerDnsName}`,
    });
  }
}
