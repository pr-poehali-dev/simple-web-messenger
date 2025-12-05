import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    API для работы с чатами
    GET /chats?user_id=X - получить список чатов пользователя
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {}) or {}
        user_id = params.get('user_id', '1')
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT DISTINCT c.id, c.name, c.chat_type,
                   (SELECT m.content FROM messages m WHERE m.chat_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
                   (SELECT m.created_at FROM messages m WHERE m.chat_id = c.id ORDER BY m.created_at DESC LIMIT 1) as last_message_time,
                   (SELECT COUNT(*) FROM messages m 
                    LEFT JOIN chat_participants cp ON cp.chat_id = m.chat_id AND cp.user_id = %s
                    WHERE m.chat_id = c.id 
                    AND (cp.last_read_at IS NULL OR m.created_at > cp.last_read_at)
                    AND m.sender_id != %s) as unread_count,
                   (SELECT u.full_name FROM users u 
                    JOIN chat_participants cp2 ON cp2.user_id = u.id 
                    WHERE cp2.chat_id = c.id AND u.id != %s LIMIT 1) as other_user_name,
                   (SELECT u.avatar_url FROM users u 
                    JOIN chat_participants cp3 ON cp3.user_id = u.id 
                    WHERE cp3.chat_id = c.id AND u.id != %s LIMIT 1) as other_user_avatar,
                   (SELECT u.status FROM users u 
                    JOIN chat_participants cp4 ON cp4.user_id = u.id 
                    WHERE cp4.chat_id = c.id AND u.id != %s LIMIT 1) as other_user_status
            FROM chats c
            JOIN chat_participants cp ON cp.chat_id = c.id
            WHERE cp.user_id = %s
            ORDER BY last_message_time DESC NULLS LAST
        ''', (user_id, user_id, user_id, user_id, user_id, user_id))
        
        chats = cur.fetchall()
        cur.close()
        conn.close()
        
        result = []
        for chat in chats:
            chat_dict = dict(chat)
            if chat_dict['chat_type'] == 'direct' and chat_dict['other_user_name']:
                chat_dict['display_name'] = chat_dict['other_user_name']
            else:
                chat_dict['display_name'] = chat_dict['name'] or 'Групповой чат'
            result.append(chat_dict)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result, default=str),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
