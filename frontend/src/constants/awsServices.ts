export const AWS_SERVICES = [
  // Compute
  { id: 'ec2', name: 'EC2', category: 'Compute' },
  { id: 'lambda', name: 'Lambda', category: 'Compute' },
  { id: 'ecs', name: 'ECS', category: 'Compute' },
  { id: 'eks', name: 'EKS', category: 'Compute' },
  { id: 'fargate', name: 'Fargate', category: 'Compute' },

  // Storage
  { id: 's3', name: 'S3', category: 'Storage' },
  { id: 'ebs', name: 'EBS', category: 'Storage' },
  { id: 'efs', name: 'EFS', category: 'Storage' },
  { id: 'glacier', name: 'Glacier', category: 'Storage' },

  // Database
  { id: 'rds', name: 'RDS', category: 'Database' },
  { id: 'dynamodb', name: 'DynamoDB', category: 'Database' },
  { id: 'aurora', name: 'Aurora', category: 'Database' },
  { id: 'elasticache', name: 'ElastiCache', category: 'Database' },
  { id: 'redshift', name: 'Redshift', category: 'Database' },

  // Networking
  { id: 'vpc', name: 'VPC', category: 'Networking' },
  { id: 'cloudfront', name: 'CloudFront', category: 'Networking' },
  { id: 'route53', name: 'Route 53', category: 'Networking' },
  { id: 'elb', name: 'ELB/ALB', category: 'Networking' },
  { id: 'apigateway', name: 'API Gateway', category: 'Networking' },

  // Security
  { id: 'iam', name: 'IAM', category: 'Security' },
  { id: 'cognito', name: 'Cognito', category: 'Security' },
  { id: 'kms', name: 'KMS', category: 'Security' },
  { id: 'waf', name: 'WAF', category: 'Security' },

  // Management
  { id: 'cloudwatch', name: 'CloudWatch', category: 'Management' },
  { id: 'cloudformation', name: 'CloudFormation', category: 'Management' },
  { id: 'cloudtrail', name: 'CloudTrail', category: 'Management' },
  { id: 'systemsmanager', name: 'Systems Manager', category: 'Management' },

  // Application Integration
  { id: 'sqs', name: 'SQS', category: 'Application Integration' },
  { id: 'sns', name: 'SNS', category: 'Application Integration' },
  { id: 'eventbridge', name: 'EventBridge', category: 'Application Integration' },
  { id: 'stepfunctions', name: 'Step Functions', category: 'Application Integration' },

  // Analytics
  { id: 'athena', name: 'Athena', category: 'Analytics' },
  { id: 'glue', name: 'Glue', category: 'Analytics' },
  { id: 'kinesis', name: 'Kinesis', category: 'Analytics' },

  // Developer Tools
  { id: 'codecommit', name: 'CodeCommit', category: 'Developer Tools' },
  { id: 'codebuild', name: 'CodeBuild', category: 'Developer Tools' },
  { id: 'codedeploy', name: 'CodeDeploy', category: 'Developer Tools' },
  { id: 'codepipeline', name: 'CodePipeline', category: 'Developer Tools' },
] as const

export type AWSServiceId = typeof AWS_SERVICES[number]['id']

export const AWS_SERVICE_CATEGORIES = [
  'Compute',
  'Storage',
  'Database',
  'Networking',
  'Security',
  'Management',
  'Application Integration',
  'Analytics',
  'Developer Tools',
] as const
