// src/components/Login.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import AuthContext from './contextProviders/AuthContext';


export const Login = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { login, error } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [createdAt, setCreatedAt] = useState('');

  const loginUser = async (event) => {
    event.preventDefault();
    setErrorMsg('')

    login(username, password, (result) => {
      if (!result.success) {
        setErrorMsg(result.error);
        return;
      }

      setLoginSuccess(true);
      setErrorMsg('');
      setTimeout(() => {
        navigate('/');
      }, 1000);
    });


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
                  <Form.Label style={{ color: '#5D6C89', 'fontWeight': 'bold' }}>{t('username-message')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('enter-username-placeholder')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label style={{ color: '#5D6C89', 'fontWeight': 'bold' }}>{t('password-message')}</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder={t('enter-password-placeholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button type="submit" className="w-100" style={{ backgroundColor: '#FEB06A', borderColor: '#FEB06A', color: '#5D6C89' }}>
                    {t('login-message')}
                </Button>
              </Form>
              {loginSuccess && <Alert variant="success" className="mt-3">{t('login-success')}</Alert>}
              {errorMsg && <Alert variant="danger" className="mt-3">{errorMsg}</Alert>}
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};
