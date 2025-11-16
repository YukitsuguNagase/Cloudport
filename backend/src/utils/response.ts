import { APIGatewayProxyResult } from 'aws-lambda'

export const successResponse = (data: any, statusCode = 200): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(data),
  }
}

export const errorResponse = (message: string, statusCode = 500): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({ error: message }),
  }
}

export const badRequestResponse = (message: string): APIGatewayProxyResult => {
  return errorResponse(message, 400)
}

export const unauthorizedResponse = (message = 'Unauthorized'): APIGatewayProxyResult => {
  return errorResponse(message, 401)
}

export const forbiddenResponse = (message = 'Forbidden'): APIGatewayProxyResult => {
  return errorResponse(message, 403)
}

export const notFoundResponse = (message = 'Not Found'): APIGatewayProxyResult => {
  return errorResponse(message, 404)
}
