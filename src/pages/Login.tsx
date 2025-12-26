import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Divider, 
  message, 
  Row, 
  Col,
  Space,
  Checkbox
} from 'antd';
import { 
  LockOutlined, 
  UserOutlined, 
  MailOutlined,
  GoogleOutlined,
  GithubOutlined,
  FacebookOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
// import loginImage from '@/assets/login-illustration.svg'; // Añade una imagen opcional

const { Title, Text, Paragraph } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('¡Bienvenido de nuevo!');
      navigate('/');
    } catch (error: any) {
      message.error(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    message.info('Inicio con Google en desarrollo');
  };

  const handleGithubLogin = () => {
    message.info('Inicio con GitHub en desarrollo');
  };

  const handleFacebookLogin = () => {
    message.info('Inicio con Facebook en desarrollo');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Row gutter={[48, 24]} justify="center" align="middle" className="w-full max-w-6xl">
        {/* Columna izquierda - Ilustración */}
        <Col xs={24} lg={12} className="hidden lg:block">
          <div className="text-center">
            <div className="mb-8">
              <div className="text-5xl font-bold text-blue-600 mb-2">TechStore</div>
              <Text className="text-gray-600 text-lg">Gestión inteligente de inventario y ventas</Text>
            </div>
            <div className="mt-8">
              <Paragraph className="text-gray-600">
                "La solución más completa para la gestión de tu negocio"
              </Paragraph>
            </div>
          </div>
        </Col>

        {/* Columna derecha - Formulario */}
        <Col xs={24} lg={12}>
          <Card 
            className="shadow-2xl border-0 rounded-2xl"
            style={{ 
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            <div className="text-center mb-8">
              <Title level={2} className="mb-2">
                ¡Bienvenido de nuevo!
              </Title>
              <Text type="secondary">
                Ingresa tus credenciales para continuar
              </Text>
            </div>

            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: 'Por favor ingresa tu usuario' },
                  { min: 3, message: 'Mínimo 3 caracteres' }
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Usuario"
                  className="rounded-lg h-12"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Por favor ingresa tu contraseña' },
                  { min: 6, message: 'Mínimo 6 caracteres' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Contraseña"
                  className="rounded-lg h-12"
                />
              </Form.Item>

              <div className="flex justify-between items-center mb-6">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Recordarme</Checkbox>
                </Form.Item>
                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  className="rounded-lg h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Iniciar Sesión
                </Button>
              </Form.Item>
            </Form>

            <Divider plain>
              <Text type="secondary">O continúa con</Text>
            </Divider>

            <Space direction="vertical" size="middle" className="w-full">
              <Button
                icon={<GoogleOutlined />}
                size="large"
                block
                className="rounded-lg h-12 border-gray-300 hover:border-blue-500 hover:text-blue-500"
                onClick={handleGoogleLogin}
              >
                Continuar con Google
              </Button>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Button
                    icon={<GithubOutlined />}
                    size="large"
                    block
                    className="rounded-lg h-12"
                    onClick={handleGithubLogin}
                  >
                    GitHub
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    icon={<FacebookOutlined />}
                    size="large"
                    block
                    className="rounded-lg h-12 bg-blue-600 text-white hover:bg-blue-700"
                    onClick={handleFacebookLogin}
                  >
                    Facebook
                  </Button>
                </Col>
              </Row>
            </Space>

            <div className="text-center mt-8">
              <Text type="secondary">
                ¿No tienes una cuenta?{' '}
                <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-800">
                  Regístrate aquí
                </Link>
              </Text>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center mt-6">
            <Text type="secondary" className="text-sm">
              © {new Date().getFullYear()} TechStore. Todos los derechos reservados.
            </Text>
            <div className="mt-2">
              <Link to="/privacy" className="text-gray-500 text-sm hover:text-gray-700 mr-4">
                Privacidad
              </Link>
              <Link to="/terms" className="text-gray-500 text-sm hover:text-gray-700">
                Términos
              </Link>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Login;