import React from 'react'
import ClassificationOverview from './classification-overview'

const DataAssets: React.FC = () => {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      borderTopLeftRadius: 0,
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      border: '1px solid #f3f4f6',
      padding: 24,
    }}>
      <ClassificationOverview />
    </div>
  )
}

export default DataAssets
