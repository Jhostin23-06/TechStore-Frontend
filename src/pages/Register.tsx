import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  message, 
  Row, 
  Col,
  Select,
  Steps,
  Space,
  Alert,
  Divider,
  theme,
  Progress,
  Tooltip
} from 'antd';
import { 
  LockOutlined, 
  UserOutlined, 
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import authService, { RegisterRequest } from '@/services/auth.service';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
// const { Step } = Steps;
const { useToken } = theme;

interface PasswordStrength {
  score: number;
  color: string;
  label: string;
}

const Register: React.FC = () => {
  const { token } = useToken();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    color: '#ff4d4f',
    label: 'Débil'
  });

  const steps = [
    {
      title: 'Información Personal',
      icon: <UserOutlined />
    },
    {
      title: 'Credenciales',
      icon: <LockOutlined />
    },
    {
      title: 'Confirmar',
      icon: <CheckCircleOutlined />
    }
  ];

  // Efecto para calcular fortaleza de contraseña
  useEffect(() => {
    const password = form.getFieldValue('password') || '';
    calculatePasswordStrength(password);
  }, [form.getFieldValue('password')]);

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    const strengthLevels = [
      { score: 0, color: '#ff4d4f', label: 'Muy débil' },
      { score: 1, color: '#ff4d4f', label: 'Débil' },
      { score: 2, color: '#faad14', label: 'Regular' },
      { score: 3, color: '#1890ff', label: 'Buena' },
      { score: 4, color: '#52c41a', label: 'Fuerte' },
      { score: 5, color: '#389e0d', label: 'Excelente' }
    ];
    
    setPasswordStrength(strengthLevels[score]);
  };

  const getStrengthRequirements = () => {
    const password = form.getFieldValue('password') || '';
    return [
      { met: password.length >= 8, text: 'Al menos 8 caracteres' },
      { met: /[A-Z]/.test(password), text: 'Al menos una mayúscula' },
      { met: /[a-z]/.test(password), text: 'Al menos una minúscula' },
      { met: /[0-9]/.test(password), text: 'Al menos un número' },
      { met: /[^A-Za-z0-9]/.test(password), text: 'Al menos un carácter especial' }
    ];
  };

  const handleRegister = async () => {
    try {
      // Validar todos los campos primero
      const values = await form.validateFields();
      
      console.log('Datos del formulario:', values);
      
      setLoading(true);
      
      // Preparar datos para el registro
      const registerData: RegisterRequest = {
        username: values.username,
        password: values.password,
        role: values.role || 'User'
      };
      
      console.log('Enviando registro:', registerData);
      
      // Llamar al servicio de registro
      const response = await authService.register(registerData);
      
      console.log('Respuesta del registro:', response);
      
      message.success('¡Cuenta creada exitosamente!');
      setCurrentStep(2);
      
      // Redirigir automáticamente después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error: any) {
      console.error('Error en registro:', error);
      
      if (error.errorFields) {
        // Error de validación del formulario
        message.error('Por favor completa todos los campos requeridos correctamente');
      } else {
        // Error del servidor o de la API
        message.error(error.message || 'Error al registrar usuario');
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    try {
      const fields = currentStep === 0 
        ? ['firstName', 'lastName', 'email', 'phone']
        : ['username', 'password', 'confirmPassword', 'role'];
      
      await form.validateFields(fields);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="mb-6">
              <Title level={4} className="mb-1">
                Información Personal
              </Title>
              <Text type="secondary">
                Ingresa tus datos básicos para crear tu cuenta
              </Text>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="firstName"
                  label="Nombre"
                  rules={[
                    { required: true, message: 'Por favor ingresa tu nombre' },
                    { min: 2, message: 'Mínimo 2 caracteres' }
                  ]}
                >
                  <Input 
                    size="large"
                    placeholder="Juan"
                    prefix={<UserOutlined />}
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="lastName"
                  label="Apellido"
                  rules={[
                    { required: true, message: 'Por favor ingresa tu apellido' },
                    { min: 2, message: 'Mínimo 2 caracteres' }
                  ]}
                >
                  <Input 
                    size="large"
                    placeholder="Pérez"
                    prefix={<UserOutlined />}
                    className="rounded-lg"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="email"
              label="Correo electrónico"
              rules={[
                { required: true, message: 'Por favor ingresa tu correo' },
                { type: 'email', message: 'Correo electrónico inválido' }
              ]}
            >
              <Input 
                size="large"
                placeholder="juan.perez@ejemplo.com"
                prefix={<MailOutlined />}
                className="rounded-lg"
              />
            </Form.Item>

            <div className="flex justify-end">
              <Button
                type="primary"
                size="large"
                onClick={nextStep}
                className="rounded-lg px-8 h-12"
              >
                Continuar
                <span className="ml-2">→</span>
              </Button>
            </div>
          </>
        );

      case 1:
        return (
          <>
            <div className="mb-6">
              <Title level={4} className="mb-1">
                Credenciales de Acceso
              </Title>
              <Text type="secondary">
                Crea un nombre de usuario y contraseña segura
              </Text>
            </div>

            <Form.Item
              name="username"
              label="Nombre de usuario"
              rules={[
                { required: true, message: 'Por favor elige un nombre de usuario' },
                { min: 3, message: 'Mínimo 3 caracteres' },
                { max: 20, message: 'Máximo 20 caracteres' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: 'Solo letras, números y guiones bajos' }
              ]}
            >
              <Input 
                size="large"
                placeholder="juan.perez"
                prefix={<UserOutlined />}
                className="rounded-lg"
                suffix={
                  <Tooltip title="Este será tu identificador único">
                    <InfoCircleOutlined style={{ color: '#bfbfbf' }} />
                  </Tooltip>
                }
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <div className="flex items-center justify-between w-full">
                  <span>Contraseña</span>
                  <div className="flex items-center">
                    <SafetyOutlined style={{ color: passwordStrength.color, marginRight: 4 }} />
                    <Text style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </Text>
                  </div>
                </div>
              }
              rules={[
                { required: true, message: 'Por favor crea una contraseña' },
                { min: 8, message: 'Mínimo 8 caracteres' }
              ]}
            >
              <Input.Password
                size="large"
                placeholder="••••••••"
                prefix={<LockOutlined />}
                className="rounded-lg"
                iconRender={(visible) => 
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                onChange={(e) => calculatePasswordStrength(e.target.value)}
              />
            </Form.Item>

            {/* Indicador de fortaleza de contraseña */}
            <div className="mb-6">
              <Progress
                percent={passwordStrength.score * 20}
                strokeColor={passwordStrength.color}
                showInfo={false}
                size="small"
              />
              <div className="mt-2 grid grid-cols-2 gap-2">
                {getStrengthRequirements().map((req, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircleOutlined 
                      style={{ 
                        color: req.met ? '#52c41a' : '#d9d9d9',
                        marginRight: 8
                      }} 
                    />
                    <Text type={req.met ? 'success' : 'secondary'}>
                      {req.text}
                    </Text>
                  </div>
                ))}
              </div>
            </div>

            <Form.Item
              name="confirmPassword"
              label="Confirmar contraseña"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Por favor confirma tu contraseña' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Las contraseñas no coinciden'));
                  },
                }),
              ]}
            >
              <Input.Password
                size="large"
                placeholder="••••••••"
                prefix={<LockOutlined />}
                className="rounded-lg"
                iconRender={(visible) => 
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item
              name="role"
              label="Tipo de cuenta"
              initialValue="User"
              rules={[{ required: true, message: 'Por favor selecciona un tipo de cuenta' }]}
            >
              <Select size="large" className="rounded-lg">
                <Option value="User">
                  <div className="flex items-center">
                    <UserOutlined className="mr-2" />
                    <span>Usuario Regular</span>
                    <Text type="secondary" className="ml-2 text-xs">
                      (Acceso básico)
                    </Text>
                  </div>
                </Option>
                <Option value="Admin">
                  <div className="flex items-center">
                    <SafetyOutlined className="mr-2" />
                    <span>Administrador</span>
                    <Text type="secondary" className="ml-2 text-xs">
                      (Acceso completo)
                    </Text>
                  </div>
                </Option>
              </Select>
            </Form.Item>

            <div className="flex justify-between">
              <Button
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={prevStep}
                className="rounded-lg px-6 h-12"
              >
                Atrás
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleRegister}
                loading={loading}
                className="rounded-lg px-8 h-12"
              >
                {loading ? 'Registrando...' : 'Crear Cuenta'}
              </Button>
            </div>
          </>
        );

      case 2:
        return (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-6">
              <CheckCircleOutlined 
                style={{ fontSize: 40, color: '#52c41a' }} 
              />
            </div>
            
            <Title level={3} className="mb-4">
              ¡Registro Completado!
            </Title>
            
            <Text type="secondary" className="block mb-2">
              Tu cuenta ha sido creada exitosamente.
            </Text>
            <Text type="secondary" className="block mb-8">
              Te redirigiremos automáticamente al inicio de sesión.
            </Text>

            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <Title level={5} className="mb-4">
                Próximos pasos:
              </Title>
              <Space direction="vertical" size="middle" className="w-full">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <Text>Verifica tu correo electrónico (si lo habilitaste)</Text>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <Text>Inicia sesión con tus nuevas credenciales</Text>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <Text>Configura tu perfil y preferencias</Text>
                </div>
              </Space>
            </div>

            <div className="space-x-4">
              <Button
                size="large"
                onClick={() => setCurrentStep(0)}
                className="rounded-lg px-6 h-12"
              >
                Crear otra cuenta
              </Button>
              <Link to="/login">
                <Button 
                  type="primary" 
                  size="large"
                  className="rounded-lg px-8 h-12"
                >
                  Ir a Inicio de Sesión
                </Button>
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${token.colorPrimaryBg} 0%, ${token.colorBgContainer} 100%)`
      }}
    >
      <div className="w-full max-w-6xl">
        <Card 
          className="shadow-2xl border-0"
          styles={{
            body: { padding: '48px' }
          }}
        >
          <Row gutter={48} align="middle">
            {/* Columna izquierda - Ilustración */}
            <Col xs={24} md={12} className="hidden md:block">
              <div className="text-center">
                <div className="inline-block p-6 rounded-3xl mb-8" 
                  style={{ background: token.colorPrimaryBg }}>
                  <div className="text-5xl font-bold" style={{ color: token.colorPrimary }}>
                    <LockOutlined />
                  </div>
                </div>
                
                <Title level={2} className="mb-4">
                  Únete a TechStore
                </Title>
                
                <Paragraph type="secondary" className="mb-8">
                  Regístrate para acceder a todas las funcionalidades de gestión de inventario, 
                  ventas y reportes en tiempo real.
                </Paragraph>
                
                <div className="text-left space-y-4">
                  <div className="flex items-center">
                    <CheckCircleOutlined className="text-green-500 mr-3 text-xl" />
                    <Text strong>Gestión completa de inventario</Text>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleOutlined className="text-green-500 mr-3 text-xl" />
                    <Text strong>Reportes detallados y análisis</Text>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleOutlined className="text-green-500 mr-3 text-xl" />
                    <Text strong>Soporte multi-usuario y roles</Text>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleOutlined className="text-green-500 mr-3 text-xl" />
                    <Text strong>Acceso desde cualquier dispositivo</Text>
                  </div>
                </div>
              </div>
            </Col>

            {/* Columna derecha - Formulario */}
            <Col xs={24} md={12}>
              <div className="mb-8">
                <Link to="/" className="text-gray-600 hover:text-gray-800 mb-4 inline-block">
                  <ArrowLeftOutlined className="mr-2" />
                  Volver al inicio
                </Link>
                
                <Title level={2} className="mb-2">
                  Crear Cuenta
                </Title>
                <Text type="secondary">
                  Paso {currentStep + 1} de {steps.length}
                </Text>
              </div>

              <Steps 
                current={currentStep} 
                size="small"
                className="mb-8"
                items={steps}
              />

              <Form
                form={form}
                name="register"
                layout="vertical"
                requiredMark="optional"
                className="mb-6"
              >
                {renderStepContent()}
              </Form>

              {currentStep < 2 && (
                <>
                  <Divider plain>
                    <Text type="secondary">¿Ya tienes cuenta?</Text>
                  </Divider>
                  
                  <div className="text-center">
                    <Link to="/login">
                      <Button type="link" size="large">
                        Iniciar Sesión
                      </Button>
                    </Link>
                  </div>
                </>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <Text type="secondary" className="text-xs">
                  Al registrarte, aceptas nuestros{' '}
                  <a href="#" className="text-blue-500 hover:text-blue-700">
                    Términos de servicio
                  </a>
                  {' '}y{' '}
                  <a href="#" className="text-blue-500 hover:text-blue-700">
                    Política de privacidad
                  </a>
                </Text>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <Text type="secondary" className="text-sm">
            © {new Date().getFullYear()} TechStore. Todos los derechos reservados.
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Register;