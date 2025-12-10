import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { successResponse, errorResponse } from '../../utils/response.js'
import { Application } from '../../models/Application.js'
import { createNotification } from '../../utils/notifications.js'
import { sendEmail } from '../../utils/email.js'
import { newApplicationEmail } from '../../utils/emailTemplates.js'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const APPLICATIONS_TABLE = process.env.APPLICATIONS_TABLE!
const JOBS_TABLE = process.env.JOBS_TABLE!
const USERS_TABLE = process.env.USERS_TABLE!

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const jobId = event.pathParameters?.jobId
    const userId = event.requestContext.authorizer?.claims?.sub

    if (!jobId || !userId) {
      return errorResponse('Missing required parameters', 400)
    }

    if (!event.body) {
      return errorResponse('Request body is required', 400)
    }

    const { message } = JSON.parse(event.body)

    if (!message || !message.trim()) {
      return errorResponse('Application message is required', 400)
    }

    // Check if job exists
    const jobResult = await docClient.send(
      new GetCommand({
        TableName: JOBS_TABLE,
        Key: { jobId },
      })
    )

    if (!jobResult.Item) {
      return errorResponse('Job not found', 404)
    }

    if (jobResult.Item.status !== 'open') {
      return errorResponse('This job is not accepting applications', 400)
    }

    // Check if user already applied
    const existingApplications = await docClient.send(
      new QueryCommand({
        TableName: APPLICATIONS_TABLE,
        IndexName: 'EngineerIdIndex',
        KeyConditionExpression: 'engineerId = :engineerId',
        FilterExpression: 'jobId = :jobId',
        ExpressionAttributeValues: {
          ':engineerId': userId,
          ':jobId': jobId,
        },
      })
    )

    if (existingApplications.Items && existingApplications.Items.length > 0) {
      return errorResponse('You have already applied to this job', 400)
    }

    // Create application
    const now = new Date().toISOString()
    const application: Application = {
      applicationId: uuidv4(),
      jobId,
      engineerId: userId,
      message: message.trim(),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    }

    await docClient.send(
      new PutCommand({
        TableName: APPLICATIONS_TABLE,
        Item: application,
      })
    )

    // Increment application count on job
    await docClient.send(
      new UpdateCommand({
        TableName: JOBS_TABLE,
        Key: { jobId },
        UpdateExpression: 'SET applicationCount = if_not_exists(applicationCount, :zero) + :inc, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':zero': 0,
          ':inc': 1,
          ':updatedAt': now,
        },
      })
    )

    // Create notification for company (job owner)
    const job = jobResult.Item
    await createNotification({
      userId: job.companyId,
      type: 'new_application',
      title: '新規応募がありました',
      message: `案件「${job.title}」に新しい応募がありました`,
      link: `/jobs/${jobId}/applicants`,
      relatedId: application.applicationId,
    })

    // Send email notification to company
    try {
      const [companyResult, engineerResult] = await Promise.all([
        docClient.send(
          new GetCommand({
            TableName: USERS_TABLE,
            Key: { userId: job.companyId },
          })
        ),
        docClient.send(
          new GetCommand({
            TableName: USERS_TABLE,
            Key: { userId },
          })
        ),
      ])

      const company = companyResult.Item
      const engineer = engineerResult.Item

      if (company?.email) {
        const companyName = company.displayName || company.companyName || company.email.split('@')[0]
        const engineerName = engineer?.displayName || engineer?.name || engineer?.email?.split('@')[0] || 'エンジニア'

        const template = newApplicationEmail(companyName, job.title, engineerName, application.applicationId)
        await sendEmail({
          to: company.email,
          subject: template.subject,
          body: template.body,
        })
        console.log(`Application notification email sent to ${company.email}`)
      }
    } catch (emailError) {
      console.error('Error sending application notification email:', emailError)
      // Don't block the response
    }

    return successResponse(application, 201)
  } catch (error) {
    console.error('Error applying to job:', error)
    return errorResponse('Failed to apply to job')
  }
}
