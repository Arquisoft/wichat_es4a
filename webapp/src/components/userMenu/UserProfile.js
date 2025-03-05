import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Snackbar, Box } from '@mui/material';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import 'bootstrap/dist/css/bootstrap.min.css';
import { EditUser } from './EditUser';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/i18next.js';
import { QuestionAccordion } from '../gameHistory/QuestionAccordion.js';
import { GameHistoryButton } from '../gameHistory/GameHistoryButton.js';


const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

export const UserProfile = ({ userName, gameHistory }) => {
    const { t } = useTranslation();
    const [selectedGame, setSelectedGame] = useState(null);

    return (
        <main>
            {/* Cabecera */}
            <div className="w-95vw text-center p-3" style={{ backgroundColor: '#5D6C89', color: '#FEB06A' }}>
                <h2>{t('welcome-message')} <span className="fw-bold">{userName}</span></h2>
            </div>

            {/* Contenedor principal con sidebar y contenido */}
            <Tab.Container id="main-container" defaultActiveKey="edit">
                <Row className="border mt-3 mx-0">
                    {/* Sidebar */}
                    <Col sm={3} className="border-end p-3" style={{ backgroundColor: '#5D6C89' }}>
                        <Nav variant="pills" className="flex-column">
                            <Nav.Item>
                                <Nav.Link eventKey="edit" style={{ color: 'white' }}>{t('edit-profile')}</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="history" style={{ color: 'white' }}>{t('game-history')}</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Col>

                    {/* Contenido dinámico */}
                    <Col sm={9} className="p-3 d-flex flex-column h-100">
                        <Tab.Content className='flex-grow-1 overflow-auto'>
                            <Tab.Pane eventKey="edit" className="w-100 h-100">
                                <EditUser userName={userName} />
                            </Tab.Pane>
                            <Tab.Pane eventKey="history">
                            <div style={{ maxHeight: '70vh', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                                    {!selectedGame ? (
                                        //Mostrar la lista de partidas si NO hay partida seleccionada
                                        <>
                                            <h5>{t('recent-games-text')}</h5>
                                                {gameHistory.map((game, index) => (
                                                    <GameHistoryButton
                                                        key={index}
                                                        points={game.points}
                                                        correctAnswers={game.correctAnswers}
                                                        totalQuestions={game.totalQuestions}
                                                        date={game.date}
                                                        onClick={() => setSelectedGame(game)}
                                                    />
                                                ))}
                                        </>
                                    ) : (
                                        // Mostrar detalles de la partida si hay una partida seleccionada
                                        <>
                                            <h5 className="mt-4">{t('game-details-text')}</h5>
                                            <QuestionAccordion questions={selectedGame.questions}  />
                                            
                                        </>
                                    )}
                                </div>
                                {selectedGame ? (
                                    <>
                                        {/* Botón para volver a la lista de partidas */}
                                        <Button
                                                className="mt-3"
                                                style={{ backgroundColor: '#FEB06A', color: '#5D6C89' , borderColor: '#FEB06A' }}
                                                onClick={() => setSelectedGame(null)}
                                            >
                                                {t('back-button-text')}
                                        </Button>
                                    </>
                                ) : null}
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>

            {/* Botón Volver al Menú */}
            <Button
                size="lg"
                className="position-absolute bottom-0 end-0 m-3"
                style={{ backgroundColor: '#FEB06A', borderColor: '#FEB06A', color: '#5D6C89' }}
            >
                {t('menu-button-text')}
            </Button>
        </main>
    );
};
