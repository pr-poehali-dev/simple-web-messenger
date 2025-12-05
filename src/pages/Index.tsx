import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const API_URLS = {
  chats: 'https://functions.poehali.dev/f2668559-13a9-4b90-ac58-eb2bd853460b',
  messages: 'https://functions.poehali.dev/e2784f5a-53da-45ff-97c1-3c5bbb73f589',
  users: 'https://functions.poehali.dev/827d873a-0ab9-4bb2-a9e2-3d79b05d7d9b',
  calls: 'https://functions.poehali.dev/7c010735-4ca6-4822-b2cd-352b250e745a',
};

const CURRENT_USER_ID = 1;

interface Chat {
  id: number;
  display_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  other_user_status: string;
  chat_type: string;
}

interface Message {
  id: number;
  content: string;
  created_at: string;
  sender_id: number;
  sender_name: string;
  message_type: string;
  duration?: number;
}

interface User {
  id: number;
  full_name: string;
  email: string;
  position: string;
  department: string;
  phone: string;
  bio: string;
  status: string;
}

interface CallHistory {
  id: number;
  call_type: string;
  status: string;
  started_at: string;
  duration: number;
  initiator_name: string;
  chat_name: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<'chats' | 'profile' | 'settings' | 'notifications' | 'calls'>('chats');
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isConference, setIsConference] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [callHistory, setCallHistory] = useState<CallHistory[]>([]);
  const [conferenceParticipants, setConferenceParticipants] = useState<string[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    document.documentElement.classList.add('dark');
    loadChats();
    loadCurrentUser();
    loadCallHistory();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat);
    }
  }, [selectedChat]);

  const loadChats = async () => {
    try {
      const response = await fetch(`${API_URLS.chats}?user_id=${CURRENT_USER_ID}`);
      const data = await response.json();
      setChats(data);
      if (data.length > 0 && !selectedChat) {
        setSelectedChat(data[0].id);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  };

  const loadMessages = async (chatId: number) => {
    try {
      const response = await fetch(`${API_URLS.messages}?chat_id=${chatId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const response = await fetch(`${API_URLS.users}?id=${CURRENT_USER_ID}`);
      const data = await response.json();
      setCurrentUser(data);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadCallHistory = async () => {
    try {
      const response = await fetch(`${API_URLS.calls}?user_id=${CURRENT_USER_ID}`);
      const data = await response.json();
      setCallHistory(data);
    } catch (error) {
      console.error('Error loading call history:', error);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    try {
      await fetch(API_URLS.messages, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: selectedChat,
          sender_id: CURRENT_USER_ID,
          content: messageInput,
          message_type: 'text',
        }),
      });
      
      setMessageInput('');
      loadMessages(selectedChat);
      loadChats();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: 'Ошибка отправки сообщения', variant: 'destructive' });
    }
  };

  const startVideoCall = () => {
    setIsVideoCall(true);
    setIsConference(false);
    setConferenceParticipants([]);
  };

  const startConference = () => {
    setIsVideoCall(true);
    setIsConference(true);
    setConferenceParticipants(['Анна Петрова', 'Дмитрий Соколов', 'Мария Коваленко']);
  };

  const endVideoCall = () => {
    setIsVideoCall(false);
    setIsConference(false);
    setConferenceParticipants([]);
  };

  const toggleVoiceRecording = async () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      toast({ title: 'Запись голосового сообщения...' });
    } else {
      setIsRecordingVoice(false);
      if (selectedChat) {
        await fetch(API_URLS.messages, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: selectedChat,
            sender_id: CURRENT_USER_ID,
            content: 'Голосовое сообщение',
            message_type: 'voice',
            duration: 15,
          }),
        });
        loadMessages(selectedChat);
        toast({ title: 'Голосовое сообщение отправлено' });
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedChatData = chats.find(c => c.id === selectedChat);

  return (
    <div className="flex h-screen bg-background">
      <div className="w-20 bg-sidebar flex flex-col items-center py-6 space-y-8">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
          {currentUser?.full_name.charAt(0) || 'M'}
        </div>
        
        <nav className="flex-1 flex flex-col space-y-6">
          <Button
            variant="ghost"
            size="icon"
            className={`w-12 h-12 ${activeTab === 'chats' ? 'bg-sidebar-accent' : ''}`}
            onClick={() => setActiveTab('chats')}
          >
            <Icon name="MessageSquare" size={24} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className={`w-12 h-12 ${activeTab === 'calls' ? 'bg-sidebar-accent' : ''}`}
            onClick={() => setActiveTab('calls')}
          >
            <Icon name="Phone" size={24} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className={`w-12 h-12 ${activeTab === 'profile' ? 'bg-sidebar-accent' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <Icon name="User" size={24} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className={`w-12 h-12 ${activeTab === 'settings' ? 'bg-sidebar-accent' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Icon name="Settings" size={24} />
          </Button>
        </nav>
      </div>

      {activeTab === 'chats' && (
        <>
          <div className="w-80 border-r border-border bg-card">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Чаты</h1>
                <Button size="icon" variant="ghost">
                  <Icon name="Plus" size={20} />
                </Button>
              </div>
              
              <div className="relative">
                <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Поиск чатов..." className="pl-10" />
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-140px)]">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                    selectedChat === chat.id ? 'bg-accent/50' : ''
                  }`}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarFallback>{chat.display_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {chat.other_user_status === 'online' && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate">{chat.display_name}</p>
                        <span className="text-xs text-muted-foreground">
                          {chat.last_message_time ? formatTime(chat.last_message_time) : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">{chat.last_message || 'Нет сообщений'}</p>
                        {chat.unread_count > 0 && (
                          <Badge className="ml-2">{chat.unread_count}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {!isVideoCall ? (
            <div className="flex-1 flex flex-col">
              {selectedChat && selectedChatData && (
                <>
                  <div className="h-16 border-b border-border px-6 flex items-center justify-between bg-card">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{selectedChatData.display_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedChatData.display_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedChatData.other_user_status === 'online' ? 'В сети' : 'Не в сети'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="icon" variant="ghost" onClick={startVideoCall}>
                        <Icon name="Video" size={20} />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={startConference}>
                        <Icon name="Users" size={20} />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Icon name="MoreVertical" size={20} />
                      </Button>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender_id === CURRENT_USER_ID ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.sender_id === CURRENT_USER_ID
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-card border border-border'
                            }`}
                          >
                            {message.message_type === 'voice' ? (
                              <div className="flex items-center space-x-2">
                                <Icon name="Mic" size={16} />
                                <span>Голосовое сообщение</span>
                                {message.duration && <span className="text-xs">({message.duration}с)</span>}
                              </div>
                            ) : (
                              <p>{message.content}</p>
                            )}
                            <p className="text-xs mt-1 opacity-70">{formatTime(message.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="border-t border-border p-4 bg-card">
                    <div className="flex items-center space-x-2">
                      <Button size="icon" variant="ghost">
                        <Icon name="Paperclip" size={20} />
                      </Button>
                      <Button 
                        size="icon" 
                        variant={isRecordingVoice ? 'destructive' : 'ghost'}
                        onClick={toggleVoiceRecording}
                      >
                        <Icon name="Mic" size={20} />
                      </Button>
                      <Input
                        placeholder="Введите сообщение..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1"
                      />
                      <Button size="icon" variant="ghost">
                        <Icon name="Smile" size={20} />
                      </Button>
                      <Button onClick={sendMessage}>
                        <Icon name="Send" size={20} />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex-1 bg-black relative">
              {isConference ? (
                <div className="grid grid-cols-2 gap-4 p-8 h-full">
                  {conferenceParticipants.map((participant, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-lg flex items-center justify-center relative">
                      <Avatar className="w-24 h-24">
                        <AvatarFallback className="text-3xl">{participant.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-4 left-4 text-white font-medium">
                        {participant}
                      </div>
                    </div>
                  ))}
                  <div className="bg-gray-900 rounded-lg flex items-center justify-center relative border-2 border-primary">
                    <Avatar className="w-24 h-24">
                      <AvatarFallback className="text-3xl">{currentUser?.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-4 left-4 text-white font-medium">
                      Вы
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Avatar className="w-32 h-32 mx-auto mb-4">
                      <AvatarFallback className="text-4xl">{selectedChatData?.display_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-semibold mb-2">{selectedChatData?.display_name}</h2>
                    <p className="text-gray-400">Видеозвонок...</p>
                  </div>
                </div>
              )}

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4">
                <Button size="icon" variant="secondary" className="w-14 h-14 rounded-full">
                  <Icon name="Mic" size={24} />
                </Button>
                <Button size="icon" variant="secondary" className="w-14 h-14 rounded-full">
                  <Icon name="Video" size={24} />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="w-14 h-14 rounded-full"
                  onClick={endVideoCall}
                >
                  <Icon name="PhoneOff" size={24} />
                </Button>
                <Button size="icon" variant="secondary" className="w-14 h-14 rounded-full">
                  <Icon name="ScreenShare" size={24} />
                </Button>
                <Button size="icon" variant="secondary" className="w-14 h-14 rounded-full">
                  <Icon name="Users" size={24} />
                </Button>
              </div>

              {!isConference && (
                <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg border-2 border-gray-600">
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback>{currentUser?.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'calls' && (
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-semibold mb-8">История звонков</h1>
            
            <div className="space-y-2">
              {callHistory.map((call) => (
                <Card key={call.id} className="p-4 hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      call.status === 'missed' ? 'bg-destructive/10' : 'bg-primary/10'
                    }`}>
                      <Icon 
                        name={call.status === 'missed' ? 'PhoneMissed' : call.call_type === 'video' ? 'Video' : 'Phone'} 
                        size={24}
                        className={call.status === 'missed' ? 'text-destructive' : 'text-primary'}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">{call.initiator_name}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(call.started_at)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span className="capitalize">{call.call_type === 'video' ? 'Видеозвонок' : 'Аудиозвонок'}</span>
                        {call.duration > 0 && (
                          <>
                            <span>•</span>
                            <span>{formatDuration(call.duration)}</span>
                          </>
                        )}
                        {call.status === 'missed' && (
                          <>
                            <span>•</span>
                            <span className="text-destructive">Пропущен</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <Button size="icon" variant="ghost">
                      <Icon name="Phone" size={20} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && currentUser && (
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="w-full max-w-2xl p-8">
            <div className="text-center mb-8">
              <Avatar className="w-32 h-32 mx-auto mb-4">
                <AvatarFallback className="text-4xl">{currentUser.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-semibold mb-2">{currentUser.full_name}</h2>
              <p className="text-muted-foreground">{currentUser.email}</p>
            </div>

            <Separator className="my-6" />

            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Статус</Label>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    currentUser.status === 'online' ? 'bg-green-500' : 
                    currentUser.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                  }`} />
                  <span className="capitalize">{currentUser.status === 'online' ? 'В сети' : currentUser.status === 'away' ? 'Не на месте' : 'Не в сети'}</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Должность</Label>
                <p>{currentUser.position}</p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Отдел</Label>
                <p>{currentUser.department}</p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Телефон</Label>
                <p>{currentUser.phone}</p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">О себе</Label>
                <p className="text-muted-foreground">{currentUser.bio}</p>
              </div>

              <Button className="w-full">Редактировать профиль</Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-semibold mb-8">Параметры</h1>

            <Tabs defaultValue="general" className="space-y-6">
              <TabsList>
                <TabsTrigger value="general">Общие</TabsTrigger>
                <TabsTrigger value="notifications">Уведомления</TabsTrigger>
                <TabsTrigger value="privacy">Приватность</TabsTrigger>
                <TabsTrigger value="appearance">Внешний вид</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Основные настройки</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Автозапуск при входе в систему</Label>
                        <p className="text-sm text-muted-foreground">Запускать мессенджер при загрузке ОС</p>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Сохранять историю чатов</Label>
                        <p className="text-sm text-muted-foreground">Хранить переписку локально</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Настройки уведомлений</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Звуковые уведомления</Label>
                        <p className="text-sm text-muted-foreground">Воспроизводить звук при новых сообщениях</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Показывать превью сообщений</Label>
                        <p className="text-sm text-muted-foreground">Отображать текст в уведомлениях</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Уведомления о звонках</Label>
                        <p className="text-sm text-muted-foreground">Получать уведомления о входящих звонках</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Настройки приватности</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Статус "В сети"</Label>
                        <p className="text-sm text-muted-foreground">Показывать статус активности</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Время последнего визита</Label>
                        <p className="text-sm text-muted-foreground">Отображать время последней активности</p>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Прочтение сообщений</Label>
                        <p className="text-sm text-muted-foreground">Отправлять уведомления о прочтении</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="appearance" className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Настройки внешнего вида</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Темная тема</Label>
                        <p className="text-sm text-muted-foreground">Использовать темное оформление</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div>
                      <Label className="mb-2 block">Размер шрифта</Label>
                      <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm">Маленький</Button>
                        <Button variant="default" size="sm">Средний</Button>
                        <Button variant="outline" size="sm">Большой</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
