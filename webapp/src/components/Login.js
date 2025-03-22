// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Alert , Row, Col} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';


export const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [createdAt, setCreatedAt] = useState('');

  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';
  

  const loginUser = async () => {
    try {
      const response = await axios.post(`${apiEndpoint}/login`, { username, password });

      // Extract data from the response
      const { createdAt: userCreatedAt, token } = response.data;

      // Store the token in the session storage
      sessionStorage.setItem('token', token);

      setCreatedAt(userCreatedAt);
      setLoginSuccess(true);

  
    } catch (error) {
      setError(error.response.data.error);
    }
  };


  return (
    <section className="d-flex align-items-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F3F4F6, #B8C6D8)' }}>
        <Container>
        <Row className="align-items-center">
          <Col lg={6} className="text-center text-lg-start mb-4 mb-lg-0">
            <img src={"/images/logo.png"} alt="Wichat Logo" style={{ width: '10em' }} className="mb-3" />
            <h1 className="display-4 fw-bold" style={{ color: '#5D6C89' }}>WiChat</h1>
            <p style={{ color: '#7A859A' }}>
              {t('login-message-sponsor')}
            </p>
          </Col>
          <Col lg={6}>
            <Card className="shadow-lg p-4">
              <h2 className="text-center mb-4" style={{ color: '#5D6C89' }}>{t('login-title')}</h2>
              <Form onSubmit={loginUser}>
                <Form.Group className="mb-3" controlId="formUsername">
                  <Form.Label style={{ color: '#5D6C89' }}>{t('username-message')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label style={{ color: '#5D6C89' }}>{t('password-message')}</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button type="submit" className="w-100" style={{ backgroundColor: '#FEB06A', borderColor: '#FEB06A', color: '#5D6C89' }}>
                  Login
                </Button>
              </Form>
              {loginSuccess && <Alert variant="success" className="mt-3">{t('login-success')}</Alert>}
              {error && <Alert variant="danger" className="mt-3">{t('login-failure') + error}</Alert>}
            </Card>
          </Col>
        </Row>
      </Container>
   </section>
  );
};
