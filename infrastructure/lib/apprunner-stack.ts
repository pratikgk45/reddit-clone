import * as cdk from 'aws-cdk-lib';
import * as apprunner from '@aws-cdk/aws-apprunner-alpha';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface AppRunnerStackProps extends cdk.StackProps {
  appsyncUrl: string;
  appsyncApiKey: string;
  nextauthSecret: string;
  redditClientId: string;
  redditClientSecret: string;
  googleClientId: string;
  googleClientSecret: string;
}

export class AppRunnerStack extends cdk.Stack {
  public readonly serviceUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: AppRunnerStackProps) {
    super(scope, id, props);

    // Create IAM role for App Runner instance
    const instanceRole = new iam.Role(this, 'AppRunnerInstanceRole', {
      assumedBy: new iam.ServicePrincipal('tasks.apprunner.amazonaws.com'),
      description: 'Role for App Runner service instance',
    });

    // GitHub connection ARN (must be created manually first)
    const githubConnectionArn = new cdk.CfnParameter(this, 'GitHubConnectionArn', {
      type: 'String',
      description: 'ARN of the GitHub connection for App Runner',
      default: '',
    });

    // App Runner service
    const service = new apprunner.Service(this, 'RedditCloneService', {
      serviceName: 'reddit-clone',
      source: apprunner.Source.fromGitHub({
        repositoryUrl: 'https://github.com/pratikgk45/reddit-clone',
        branch: 'main',
        configurationSource: apprunner.ConfigurationSourceType.REPOSITORY,
        connection: apprunner.GitHubConnection.fromConnectionArn(githubConnectionArn.valueAsString),
      }),
      instanceRole,
      cpu: apprunner.Cpu.ONE_VCPU,
      memory: apprunner.Memory.TWO_GB,
      autoDeploymentsEnabled: true,
    });

    // Outputs
    this.serviceUrl = new cdk.CfnOutput(this, 'ServiceURL', {
      value: service.serviceUrl,
      description: 'App Runner service URL',
      exportName: 'RedditCloneServiceURL',
    });

    new cdk.CfnOutput(this, 'ServiceArn', {
      value: service.serviceArn,
      description: 'App Runner service ARN',
    });
  }
}
