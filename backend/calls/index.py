import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from datetime import datetime

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для работы со звонками
    GET /calls?user_id=X - получить историю звонков
    POST /calls - создать новый звонок
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    if method == 'GET':
        params = event.get('queryStringParameters', {}) or {}
        user_id = params.get('user_id', '1')
        
        cur.execute('''
            SELECT c.id, c.chat_id, c.call_type, c.status, c.started_at, c.ended_at, c.duration,
                   u.full_name as initiator_name,
                   ch.name as chat_name
            FROM calls c
            JOIN users u ON c.initiator_id = u.id
            LEFT JOIN chats ch ON c.chat_id = ch.id
            WHERE c.chat_id IN (
                SELECT chat_id FROM chat_participants WHERE user_id = %s
            )
            ORDER BY c.started_at DESC
            LIMIT 50
        ''', (user_id,))
        
        calls = cur.fetchall()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps([dict(call) for call in calls], default=str),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        chat_id = body.get('chat_id')
        initiator_id = body.get('initiator_id')
        call_type = body.get('call_type', 'video')
        
        if not all([chat_id, initiator_id]):
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'chat_id and initiator_id required'}),
                'isBase64Encoded': False
            }
        
        cur.execute('''
            INSERT INTO calls (chat_id, initiator_id, call_type, status)
            VALUES (%s, %s, %s, 'active')
            RETURNING id, started_at
        ''', (chat_id, initiator_id, call_type))
        
        result = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(dict(result), default=str),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
