import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface Message {
  id: number;
  text: string;
  time: string;
  sender: 'me' | 'other';
}

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Notification {
  id: number;
  type: 'message' | 'call' | 'system';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<'chats' | 'profile' | 'settings' | 'notifications'>('chats');
  const [selectedChat, setSelectedChat] = useState<number | null>(1);
  const [messageInput, setMessageInput] = useState('');
  const [isVideoCall, setIsVideoCall] = useState(false);

  const chats: Chat[] = [
    { id: 1, name: 'Анна Петрова', avatar: '', lastMessage: 'Отправила файлы по проекту', time: '14:30', unread: 2, online: true },
    { id: 2, name: 'Команда разработки', avatar: '', lastMessage: 'Дмитрий: Созвон в 15:00', time: '13:45', unread: 5, online: true },
    { id: 3, name: 'Иван Сергеев', avatar: '', lastMessage: 'Согласовал бюджет', time: '12:20', unread: 0, online: false },
    { id: 4, name: 'Мария Коваленко', avatar: '', lastMessage: 'Когда встреча?', time: '11:15', unread: 1, online: true },
    { id: 5, name: 'Отдел маркетинга', avatar: '', lastMessage: 'Новая кампания готова', time: 'Вчера', unread: 0, online: false },
  ];

  const messages: Message[] = [
    { id: 1, text: 'Добрый день! Отправляю документы по новому проекту', time: '14:25', sender: 'other' },
    { id: 2, text: 'Спасибо, изучу', time: '14:27', sender: 'me' },
    { id: 3, text: 'Отправила файлы по проекту', time: '14:30', sender: 'other' },
  ];

  const notifications: Notification[] = [
    { id: 1, type: 'message', title: 'Новое сообщение', description: 'Анна Петрова: Отправила файлы', time: '5 мин назад', read: false },
    { id: 2, type: 'call', title: 'Пропущенный звонок', description: 'Команда разработки', time: '15 мин назад', read: false },
    { id: 3, type: 'message', title: 'Новое сообщение', description: 'Мария Коваленко: Когда встреча?', time: '1 час назад', read: true },
    { id: 4, type: 'system', title: 'Обновление системы', description: 'Доступна новая версия', time: '2 часа назад', read: true },
  ];

  const sendMessage = () => {
    if (messageInput.trim()) {
      setMessageInput('');
    }
  };

  const startVideoCall = () => {
    setIsVideoCall(true);
  };

  const endVideoCall = () => {
    setIsVideoCall(false);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-20 bg-sidebar flex flex-col items-center py-6 space-y-8">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
          M
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
            className={`w-12 h-12 ${activeTab === 'notifications' ? 'bg-sidebar-accent' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Icon name="Bell" size={24} />
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

      {/* Main Content */}
      {activeTab === 'chats' && (
        <>
          {/* Chat List */}
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
                        <AvatarImage src={chat.avatar} />
                        <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium truncate">{chat.name}</p>
                        <span className="text-xs text-muted-foreground">{chat.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                        {chat.unread > 0 && (
                          <Badge className="ml-2">{chat.unread}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Chat Window */}
          {!isVideoCall ? (
            <div className="flex-1 flex flex-col">
              {selectedChat && (
                <>
                  {/* Chat Header */}
                  <div className="h-16 border-b border-border px-6 flex items-center justify-between bg-card">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>АП</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Анна Петрова</p>
                        <p className="text-xs text-muted-foreground">В сети</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="icon" variant="ghost" onClick={startVideoCall}>
                        <Icon name="Video" size={20} />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Icon name="Phone" size={20} />
                      </Button>
                      <Button size="icon" variant="ghost">
                        <Icon name="MoreVertical" size={20} />
                      </Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.sender === 'me'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-card border border-border'
                            }`}
                          >
                            <p>{message.text}</p>
                            <p className="text-xs mt-1 opacity-70">{message.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t border-border p-4 bg-card">
                    <div className="flex items-center space-x-2">
                      <Button size="icon" variant="ghost">
                        <Icon name="Paperclip" size={20} />
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
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Avatar className="w-32 h-32 mx-auto mb-4">
                    <AvatarFallback className="text-4xl">АП</AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-semibold mb-2">Анна Петрова</h2>
                  <p className="text-gray-400">Видеозвонок...</p>
                </div>
              </div>

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

              <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg border-2 border-gray-600">
                <div className="w-full h-full flex items-center justify-center text-white">
                  <Icon name="User" size={48} />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'profile' && (
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="w-full max-w-2xl p-8">
            <div className="text-center mb-8">
              <Avatar className="w-32 h-32 mx-auto mb-4">
                <AvatarFallback className="text-4xl">МИ</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-semibold mb-2">Михаил Иванов</h2>
              <p className="text-muted-foreground">m.ivanov@company.com</p>
            </div>

            <Separator className="my-6" />

            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">Статус</Label>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span>В сети</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Должность</Label>
                <p>Руководитель отдела разработки</p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Отдел</Label>
                <p>Разработка продукта</p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Телефон</Label>
                <p>+7 (999) 123-45-67</p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">О себе</Label>
                <p className="text-muted-foreground">
                  Опыт в разработке корпоративных систем более 8 лет. Специализируюсь на архитектуре и управлении командой.
                </p>
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
                      <Switch />
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

      {activeTab === 'notifications' && (
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-semibold">Уведомления</h1>
              <Button variant="outline" size="sm">
                <Icon name="CheckCheck" size={16} className="mr-2" />
                Прочитать все
              </Button>
            </div>

            <div className="space-y-2">
              {notifications.map((notif) => (
                <Card
                  key={notif.id}
                  className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${
                    !notif.read ? 'border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {notif.type === 'message' && (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon name="MessageSquare" size={20} className="text-primary" />
                        </div>
                      )}
                      {notif.type === 'call' && (
                        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                          <Icon name="PhoneMissed" size={20} className="text-destructive" />
                        </div>
                      )}
                      {notif.type === 'system' && (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Icon name="Info" size={20} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium">{notif.title}</h3>
                        <span className="text-xs text-muted-foreground">{notif.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{notif.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
