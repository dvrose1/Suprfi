// ABOUTME: Dynamic OG image for link sharing
// ABOUTME: Shows SuprFi branding with teal and white colors

import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'SuprFi - Home Repair Financing';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0F2D4A 0%, #1a3d5c 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        {/* S Logo */}
        <svg
          width="120"
          height="157"
          viewBox="57 41 175 229"
          fill="none"
          style={{ marginBottom: '40px' }}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M139.645 128H175.664C220.534 130.91 243.969 179.793 225.845 219.951C212.152 250.289 186.238 266.576 153.816 270H57L61.7228 243.23L65.265 218.787H153.816C167.894 218.787 179.203 208.572 179.203 194.344C179.203 186.449 172.711 175.204 168.578 169.32C157.952 154.189 155.591 150.115 139.645 128Z"
            fill="#2A9D8F"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M149.355 183H113.336C68.4659 180.09 45.0312 131.207 63.1551 91.0492C76.8475 60.7105 102.762 44.4245 135.184 41L232 41L227.277 67.7705L223.735 92.2131L135.184 92.2131C121.106 92.2131 109.797 102.428 109.797 116.656C109.797 124.551 116.289 135.796 120.422 141.68C131.048 156.811 133.409 160.885 149.355 183Z"
            fill="#FAFAFA"
          />
        </svg>

        {/* Text */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 700,
            color: 'white',
            marginBottom: '20px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          SuprFi
        </div>
        <div
          style={{
            fontSize: '32px',
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center',
            maxWidth: '800px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          AI-powered financing for home services
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
