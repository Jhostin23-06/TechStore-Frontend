import React from 'react'
import { Button, Tooltip } from 'antd'
import { SunOutlined, MoonOutlined } from '@ant-design/icons'
import { useTheme } from '@/contexts/ThemeContext'

const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useTheme()

  return (
    <Tooltip 
      title={mode === 'dark' ? 'Activar modo claro ☀️' : 'Activar modo oscuro 🌙'}
      color={mode === 'dark' ? 'orange' : 'blue'}
    >
      <Button
        type="default"
        shape="circle"
        icon={mode === 'dark' ? 
          <SunOutlined className="text-orange-500" /> : 
          <MoonOutlined className="text-blue-300" />
        }
        onClick={toggleTheme}
        className={`
          flex items-center justify-center
          transition-all duration-500 ease-in-out
          ${mode === 'dark' 
            ? 'bg-gradient-to-br from-orange-50 to-yellow-100 hover:from-orange-100 hover:to-yellow-200 text-orange-600 border-orange-200' 
            : 'bg-gradient-to-br from-gray-800 to-blue-900 hover:from-gray-900 hover:to-blue-800 text-blue-100 border-blue-700'
          }
          shadow-lg hover:shadow-xl
          transform hover:rotate-12 hover:scale-110
          active:scale-95
          w-11 h-11
        `}
        style={{
          minWidth: '44px',
          minHeight: '44px',
        }}
      />
    </Tooltip>
  )
}

export default ThemeToggle