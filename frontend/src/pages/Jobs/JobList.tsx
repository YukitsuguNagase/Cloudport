import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Job } from '../../types/job'
import { getJobs } from '../../services/jobs'

function JobList() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const data = await getJobs()
      setJobs(data)
    } catch (err: any) {
      setError(err.message || '案件の取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20">読み込み中...</div>
  }

  if (error) {
    return <div className="text-center py-20 text-red-600">{error}</div>
  }

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">案件一覧</h1>
          <Link
            to="/jobs/new"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            案件を投稿
          </Link>
        </div>

        <div className="grid gap-6">
          {jobs.map((job) => (
            <Link
              key={job.jobId}
              to={`/jobs/${job.jobId}`}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <h3 className="text-xl font-bold mb-2">{job.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
              <div className="flex gap-2 flex-wrap mb-4">
                {job.requirements.awsServices.map((service) => (
                  <span
                    key={service}
                    className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{job.duration.type === 'short' ? '短期' : '長期'}</span>
                <span>{job.applicationCount}件の応募</span>
              </div>
            </Link>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            案件がありません
          </div>
        )}
      </div>
    </div>
  )
}

export default JobList
