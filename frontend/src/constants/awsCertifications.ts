export const AWS_CERTIFICATIONS = [
  // Foundational
  { id: 'clf-c02', name: 'AWS Certified Cloud Practitioner', category: 'Foundational' },

  // Associate
  { id: 'saa-c03', name: 'AWS Certified Solutions Architect - Associate', category: 'Associate' },
  { id: 'dva-c02', name: 'AWS Certified Developer - Associate', category: 'Associate' },
  { id: 'soa-c02', name: 'AWS Certified SysOps Administrator - Associate', category: 'Associate' },

  // Professional
  { id: 'sap-c02', name: 'AWS Certified Solutions Architect - Professional', category: 'Professional' },
  { id: 'dop-c02', name: 'AWS Certified DevOps Engineer - Professional', category: 'Professional' },

  // Specialty
  { id: 'ans-c01', name: 'AWS Certified Advanced Networking - Specialty', category: 'Specialty' },
  { id: 'scs-c02', name: 'AWS Certified Security - Specialty', category: 'Specialty' },
  { id: 'mls-c01', name: 'AWS Certified Machine Learning - Specialty', category: 'Specialty' },
  { id: 'das-c01', name: 'AWS Certified Data Analytics - Specialty', category: 'Specialty' },
  { id: 'dbs-c01', name: 'AWS Certified Database - Specialty', category: 'Specialty' },
  { id: 'sap-c01', name: 'AWS Certified SAP on AWS - Specialty', category: 'Specialty' },
] as const

export type AWSCertificationId = typeof AWS_CERTIFICATIONS[number]['id']
