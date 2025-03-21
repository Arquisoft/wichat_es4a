import React, { useState } from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useTranslation } from 'react-i18next';
import Modal from 'react-bootstrap/Modal';
import i18n from '../../i18n/i18next.js';

const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

export const EditUser = ({ userName }) => {
    const { t } = useTranslation();
    
    // Estados para los campos
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);

    /**
     * Función para validar que las contraseñas coincidan
     */
    const validatePasswords = () => {
        if (password !== confirmPassword) {
            setError(t('password-mismatch-error'));
            return false;
        }
        setError(''); // Limpia el error si todo está bien
        return true;
    };

    /**
     * Función que valida la contraseña cuando se intenta guardar. Valida que:
     * - Tenga al menos una mayúscula
     * - Tenga al menos un número
     * - No tenga espacios
     */
    const validatePasswordContentOnSubmit = () => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasNoSpaces = !/\s/.test(password);

        if (!hasUpperCase) {
            return t('password-error-uppercase');
        }
        if (!hasNumber) {
            return t('password-error-number');
        }
        if (!hasNoSpaces) {
            return t('password-error-no-spaces');
        }

        return ''; 
    };


    /**
     * Función para manejar el envío del formulario
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita que la página se recargue

        // Validar contenido de la contraseña solo al enviar el formulario
        const validationError = validatePasswordContentOnSubmit();
        if (validationError) {
            setError(validationError);
            return;
        }

        if (!validatePasswords()) return;

        try {
            
            // TODO Petición a la API para actualizar la contraseña

            setShowModal(true); // Muestra el modal de confirmación
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            setError(t('password-update-failure')); // Error en la actualización
        }
    };

    /**
     * Función para validar la contraseña. Valida que:
     * - Tenga al menos 8 caracteres
     */
    const checkPasswordLength = (password) => {
        const minLength = 8;
    
        if (password.length < minLength) {
            return t('password-error-min-length');
        }
    
        return ''; 
    };
    
    // Validar en el cambio de contraseña
    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        
        const errorMsg = checkPasswordLength(newPassword);
        setError(errorMsg); // Muestra el error si hay uno
    };
    

    
    return (
        <>
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasic">
                    <Form.Label>{t('user-name-edit')}</Form.Label>
                    <Form.Control type="text" placeholder={userName} disabled />
                    <Form.Text className="text-muted">
                        {t('not-edit-permission')}
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>{t('password-edit')}</Form.Label>
                    <Form.Control 
                        type="password" 
                        placeholder={t('password-placeholder')} 
                        value={password} 
                        onChange={handlePasswordChange}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicConfirmPassword">
                    <Form.Label>{t('password-edit-confirm')}</Form.Label>
                    <Form.Control 
                        type="password" 
                        placeholder={t('password-placeholder')} 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </Form.Group>

                {error && <p className="text-danger">{error}</p>}

                <Button type="submit" style={{ backgroundColor: '#FEB06A', borderColor: '#FEB06A', color: "#5D6C89" }}>
                    {t('save-changes-button')}
                </Button>
            </Form>

            {/* Modal de confirmación */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{t('modal-title-edit-profile')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{t('password-update-success')}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        {t('close-button-text')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
