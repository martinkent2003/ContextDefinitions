import React from 'react'
import { Text } from '@/components/ui'
import { spacing } from '@/constants/Themes'
import ConfirmModal from '@screens/UploadScreen/Components/ConfirmModal'

export default function ConfirmScan() {
  return (
    <ConfirmModal
      visible={false}
      title="Scan Document"
      icon="scan-outline"
      onCancel={() => {}}
      onConfirm={() => {}}
      confirmDisabled
    >
      <Text style={{ textAlign: 'center', marginBottom: spacing.sm }}>
        Document scanning is not supported on web.
      </Text>
    </ConfirmModal>
  )
}
