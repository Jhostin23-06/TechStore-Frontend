import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, LockOutlined } from '@ant-design/icons';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Result
        icon={<LockOutlined className="text-red-500" />}
        status="403"
        title="403"
        subTitle="Lo sentimos, no tienes permiso para acceder a esta página."
        extra={[
          <Button 
            key="home" 
            type="primary" 
            icon={<HomeOutlined />}
            onClick={() => navigate('/')}
          >
            Volver al Inicio
          </Button>,
          <Button 
            key="back" 
            onClick={() => navigate(-1)}
          >
            Volver Atrás
          </Button>,
        ]}
      />
    </div>
  );
};

export default Unauthorized;