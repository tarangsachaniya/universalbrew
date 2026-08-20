import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F7EFE1',
          borderRadius: '50%',
        }}
      >
        <div
          style={{
            width: '85%',
            height: '85%',
            borderRadius: '50%',
            border: '4px solid #5C3A21',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 64,
            fontWeight: 700,
            color: '#5C3A21',
            fontFamily: 'Georgia, serif',
          }}
        >
          UB
        </div>
      </div>
    ),
    { ...size }
  )
}
