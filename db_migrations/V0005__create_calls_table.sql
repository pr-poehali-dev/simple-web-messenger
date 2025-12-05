CREATE TABLE calls (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL,
    initiator_id INTEGER NOT NULL,
    call_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'ended',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    duration INTEGER
);

CREATE TABLE call_participants (
    id SERIAL PRIMARY KEY,
    call_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP
);

CREATE INDEX idx_calls_chat_id ON calls(chat_id);
CREATE INDEX idx_call_participants_call_id ON call_participants(call_id);