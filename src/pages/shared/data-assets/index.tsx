import React from 'react'
import ClassificationOverview from '../../dashboard/components/data-assets/classification-overview'

const SharedDataAssets: React.FC = () => {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: '1px solid #f3f4f6',
      padding: '14px 24px 34px',
    }}>
      <ClassificationOverview />
    </div>
  )
}

export default SharedDataAssets
