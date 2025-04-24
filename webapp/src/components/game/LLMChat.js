import React, { useState, useRef } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { useTranslation } from 'react-i18next';
import { askClue } from '../../services/LLMService';
import { Typewriter } from "react-simple-typewriter";
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

/**
 * React component that represents a chat with the LLM to ask for clues.
 * @param {String} name - The name (correctAnswer) that the LLM has to avoid to say.
 * @returns a chat with the LLM to ask for clues.
 */
const LLMChat = ({ correctAnswer }) => {
    const { t, i18n } = useTranslation();

    const [messages, setMessages] = useState([
        <p className="llm-message" key="welcome">{t('llm-chat-welcome-msg')}</p>
    ]);
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    const [chatContext, setChatContext] = useState([]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollToBottom();
        }
    };

    /**
     * Converts a text message into speech and plays it aloud.
     *
     * @param {string} message - The message to be spoken aloud.
     */
    const writeAndspeakLoudTheMessage = (message) => {
        return (
            <Typewriter
              words={[message]}
              delaySpeed={100}
              typeSpeed={50}
              onType={scrollToBottom}
              // onLoopDone={speakLoudTheMessage(message)}
            />
        );
        
    };

    const speakLoudTheMessage = (message) => {
        const utterance = new SpeechSynthesisUtterance(message);
        const voices = speechSynthesis.getVoices();

        const desiredLang = i18n.language === "en" ? "en-US" : i18n.language === "es" ? "es-ES" : i18n.language;
        const voice = voices.find((voice) => voice.lang === desiredLang) || voices[0];

        utterance.lang = desiredLang;
        utterance.voice = voice;
        utterance.volume = 1.0;

        speechSynthesis.speak(utterance);
    }




    /**
     * This function handles the submit of a message, sending it to the chat.
     * 
     * @param {Event} e - The event of the form submission. 
     */
    /**
     * Handles the form submission event, sending the user's message to the server
     * and updating the chat with the response.
     *
     * @param {Event} e - The form submission event.
     * @returns {Promise<void>} - A promise that resolves when the message handling is complete.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Adding the new message to the chat
        if (!inputValue.trim()) return;

        // Agrega el mensaje del usuario al chat
        const userMsg = <p className="user-message" key={`user-${messages.length}`}>{inputValue}</p>;
        setMessages(prevMessages => [...prevMessages, userMsg]);

        // Activa estado de carga para deshabilitar la entrada mientras se espera la respuesta
        setLoading(true);

        try {
            setChatContext(prevContext => [
                ...prevContext,
                { role: 'user', content: inputValue.trim() }
            ]);

            const response = await askClue({ 
                correctAnswer: correctAnswer, 
                question: inputValue, 
                context: chatContext,
                language: i18n.language.split('-')[0]
            });
            const llmMsg = (
                <p className="llm-message" key={`llm-${messages.length}`}>
                    {writeAndspeakLoudTheMessage(answerText)}




                </p>
            );
            setMessages(prevMessages => [...prevMessages, llmMsg]);
            setChatContext(prevContext => [
                ...prevContext,
                { role: 'assistant', content: answerText }
            ]);
        } catch (error) {
            console.error("Error enviando mensaje:", error);
            const errorMsg = (
                <p className="llm-message error" key={`error-${messages.length}`}>
                    {writeAndspeakLoudTheMessage(t('llm-chat-error-msg'))}
                </p>
            );
            setMessages(prevMessages => [...prevMessages, errorMsg]);
        } finally {
            setLoading(false);
        }

        setInputValue(''); // Cleaning the input field
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    return (
        <Card className="llm-chat" bg={'light'}>
            <Scrollbars
                ref={scrollRef}
                style={{ width: '100%', height: '100%' }}
                autoHide // Oculta el scroll cuando no se usa
                autoHideTimeout={1000} // Tiempo antes de ocultarlo
                autoHideDuration={200} // Duración de la animación al ocultarlo
                renderThumbVertical={props => (
                    <div {...props} style={{ backgroundColor: 'gray', borderRadius: '4px' }} />
                )}
                renderThumbHorizontal={props => (
                    <div {...props} style={{ display: 'none' }} /> // Hide horizontal scrollbar
                )}
            >
                <div className="llm-chat-messages">
                    {messages.map((msg, index) => (
                        <Row key={index}>
                            {msg.props.className === "llm-message" ? (
                                <>
                                    <Col md={2}>
                                        <img src="/iconoLLM.png" alt="LLM" className='llm-icon' />
                                    </Col>
                                    <Col md={8}>
                                        {msg}
                                    </Col>
                                </>
                            ) : (
                                <>
                                    <Col md={4}></Col>
                                    <Col md={8}>
                                        {msg}
                                    </Col>
                                </>
                            )}
                        </Row>
                    ))}
                </div>
            </Scrollbars>
            <form className="llm-chat-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="prompt"
                    className="llm-chat-input"
                    placeholder={t('llm-chat-placeholder')}
                    value={inputValue}
                    onChange={handleInputChange}
                    disabled={loading}
                />
                <button data-testid="chatSubmitButton" type="submit" className="send-prompt-button" disabled={loading}>
                    <img src="/send-message.png" alt="Enviar" />
                </button>
            </form>
        </Card>
    )
}

export default LLMChat;