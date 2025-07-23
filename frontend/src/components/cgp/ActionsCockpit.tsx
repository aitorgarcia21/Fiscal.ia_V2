import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { 
  Target, Plus, Search, Filter, Clock, User, Calendar, CheckCircle, X,
  Phone, FileText, PlayCircle, PauseCircle, AlertCircle, TrendingUp, Flag
} from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: 'CALL' | 'EMAIL' | 'MEETING' | 'DOCUMENT' | 'ANALYSIS' | 'FOLLOW_UP' | 'COMPLIANCE';
  priority: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
  assignedTo: string;
  clientName?: string;
  dueDate: Date;
  estimatedDuration: number;
  createdAt: Date;
  source: 'MEETING' | 'INSIGHT' | 'ALERT' | 'MANUAL' | 'SYSTEM';
  francisContext?: {
    confidence: number;
    businessImpact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    suggestedApproach: string;
  };
  metadata: { notes: string[]; };
}

const ActionsCockpit: React.FC = () => {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [filteredActions, setFilteredActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);

  useEffect(() => {
    loadActions();
  }, []);

  useEffect(() => {
    filterActions();
  }, [actions, searchQuery, selectedCategory, selectedStatus]);

  const loadActions = async () => {
    try {
      setLoading(true);
      
      const demoActions: ActionItem[] = [
        {
          id: 'action-001',
          title: 'Appeler Jean Dupont - Satisfaction client',
          description: 'Suite à l\'alerte de désengagement, prendre contact pour comprendre les préoccupations',
          category: 'CALL',
          priority: 9,
          status: 'PENDING',
          assignedTo: 'Marie Conseiller',
          clientName: 'Jean Dupont',
          dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
          estimatedDuration: 30,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          source: 'ALERT',
          francisContext: {
            confidence: 85,
            businessImpact: 'HIGH',
            suggestedApproach: 'Écoute active, questionnaire satisfaction, proposition RDV physique'
          },
          metadata: { notes: [] }
        },
        {
          id: 'action-002',
          title: 'Préparer audit fiscal - Client Martin',
          description: 'Analyser la situation fiscale suite aux nouveaux barèmes 2024',
          category: 'ANALYSIS',
          priority: 7,
          status: 'IN_PROGRESS',
          assignedTo: 'Pierre Fiscaliste',
          clientName: 'Sophie Martin',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          estimatedDuration: 120,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          source: 'INSIGHT',
          francisContext: {
            confidence: 92,
            businessImpact: 'MEDIUM',
            suggestedApproach: 'Utiliser simulateur Francis, identifier niches fiscales'
          },
          metadata: { notes: ['Simulation en cours', 'Économies potentielles: 3,500€'] }
        },
        {
          id: 'action-003',
          title: 'Programmer RDV - Présentation stratégie patrimoniale',
          description: 'Suite à l\'analyse, présenter les recommandations d\'optimisation',
          category: 'MEETING',
          priority: 6,
          status: 'COMPLETED',
          assignedTo: 'Marie Conseiller',
          clientName: 'Paul Dubois',
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          estimatedDuration: 90,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          source: 'MEETING',
          francisContext: {
            confidence: 78,
            businessImpact: 'MEDIUM',
            suggestedApproach: 'Préparer présentation visuelle, documents signés'
          },
          metadata: { notes: ['Client intéressé par SCI familiale', 'RDV programmé pour le 25/07'] }
        }
      ];

      setActions(demoActions);
      
    } catch (error) {
      console.error('Erreur chargement actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterActions = () => {
    let filtered = [...actions];

    if (searchQuery) {
      filtered = filtered.filter(action => 
        action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (action.clientName && action.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(action => action.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      if (selectedStatus === 'active') {
        filtered = filtered.filter(action => ['PENDING', 'IN_PROGRESS'].includes(action.status));
      } else {
        filtered = filtered.filter(action => action.status === selectedStatus.toUpperCase());
      }
    }

    setFilteredActions(filtered.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.dueDate.getTime() - b.dueDate.getTime();
    }));
  };

  const handleStatusChange = (actionId: string, newStatus: ActionItem['status']) => {
    const updatedActions = actions.map(action => {
      if (action.id === actionId) {
        return { ...action, status: newStatus };
      }
      return action;
    });
    
    setActions(updatedActions);
    
    if (selectedAction?.id === actionId) {
      const updatedAction = updatedActions.find(a => a.id === actionId);
      if (updatedAction) setSelectedAction(updatedAction);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CALL': return <Phone className="h-4 w-4" />;
      case 'EMAIL': return <FileText className="h-4 w-4" />;
      case 'MEETING': return <Calendar className="h-4 w-4" />;
      case 'DOCUMENT': return <FileText className="h-4 w-4" />;
      case 'ANALYSIS': return <TrendingUp className="h-4 w-4" />;
      case 'FOLLOW_UP': return <Clock className="h-4 w-4" />;
      case 'COMPLIANCE': return <CheckCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CALL': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'EMAIL': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'MEETING': return 'text-green-600 bg-green-50 border-green-200';
      case 'DOCUMENT': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'ANALYSIS': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'FOLLOW_UP': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'COMPLIANCE': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-300';
      case 'ON_HOLD': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'text-red-600 bg-red-50 border-red-200';
    if (priority >= 5) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) return 'En retard';
    if (diffHours < 24) return `Dans ${diffHours}h`;
    return `Dans ${diffDays}j`;
  };

  const isOverdue = (date: Date) => date.getTime() < new Date().getTime();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Target className="h-8 w-8 mr-3 text-green-600" />
            Cockpit Actions
          </h1>
          <p className="text-gray-600 mt-1">
            {filteredActions.length} actions • To-do intelligent Francis IA
          </p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Action
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {actions.filter(a => a.status === 'PENDING').length}
              </div>
              <div className="text-sm text-gray-600">En attente</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {actions.filter(a => a.status === 'IN_PROGRESS').length}
              </div>
              <div className="text-sm text-gray-600">En cours</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {actions.filter(a => a.status === 'COMPLETED').length}
              </div>
              <div className="text-sm text-gray-600">Terminées</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {actions.filter(a => isOverdue(a.dueDate) && a.status !== 'COMPLETED').length}
              </div>
              <div className="text-sm text-gray-600">En retard</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une action..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="CALL">Appels</SelectItem>
                <SelectItem value="MEETING">Réunions</SelectItem>
                <SelectItem value="ANALYSIS">Analyses</SelectItem>
                <SelectItem value="COMPLIANCE">Compliance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Actives</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                <SelectItem value="COMPLETED">Terminées</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedStatus('active');
            }}>
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {filteredActions.map((action) => (
            <Card 
              key={action.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedAction?.id === action.id ? 'ring-2 ring-green-500' : ''
              } ${isOverdue(action.dueDate) && action.status !== 'COMPLETED' ? 'border-l-4 border-l-red-500' : ''}`}
              onClick={() => setSelectedAction(action)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`p-2 rounded-lg border ${getCategoryColor(action.category)}`}>
                      {getCategoryIcon(action.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {action.title}
                      </h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getCategoryColor(action.category)}>
                          {action.category}
                        </Badge>
                        <Badge className={getStatusColor(action.status)}>
                          {action.status}
                        </Badge>
                        <Badge className={getPriorityColor(action.priority)}>
                          P{action.priority}
                        </Badge>
                      </div>
                      {action.clientName && (
                        <p className="text-sm text-gray-600">
                          Client: {action.clientName}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className={`text-xs font-medium mb-1 ${
                      isOverdue(action.dueDate) && action.status !== 'COMPLETED' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {formatDueDate(action.dueDate)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {action.estimatedDuration}min
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                  {action.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 truncate">
                        {action.assignedTo}
                      </span>
                    </div>
                    
                    {action.francisContext && (
                      <div className="flex items-center space-x-1">
                        <Flag className="h-4 w-4 text-purple-500" />
                        <span className="text-sm text-purple-600">
                          {action.francisContext.confidence}%
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {action.status === 'PENDING' && (
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(action.id, 'IN_PROGRESS');
                        }}
                      >
                        <PlayCircle className="h-3 w-3 mr-1" />
                        Démarrer
                      </Button>
                    )}
                    
                    {action.status === 'IN_PROGRESS' && (
                      <Button 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(action.id, 'COMPLETED');
                        }}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Terminer
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Détail de l'action sélectionnée */}
        <div className="lg:sticky lg:top-6">
          {selectedAction ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{selectedAction.title}</h3>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setSelectedAction(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <p className="text-gray-700 mb-4">{selectedAction.description}</p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(selectedAction.category)}>
                      {selectedAction.category}
                    </Badge>
                    <Badge className={getStatusColor(selectedAction.status)}>
                      {selectedAction.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Assignée à:</span>
                      <p className="text-gray-600">{selectedAction.assignedTo}</p>
                    </div>
                    <div>
                      <span className="font-medium">Échéance:</span>
                      <p className="text-gray-600">{formatDueDate(selectedAction.dueDate)}</p>
                    </div>
                  </div>

                  {selectedAction.francisContext && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Flag className="h-4 w-4 mr-2" />
                        Francis IA ({selectedAction.francisContext.confidence}%)
                      </h4>
                      <p className="text-sm text-purple-700">
                        {selectedAction.francisContext.suggestedApproach}
                      </p>
                    </div>
                  )}

                  {selectedAction.metadata.notes.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Notes</h4>
                      <div className="space-y-2">
                        {selectedAction.metadata.notes.map((note, idx) => (
                          <div key={idx} className="bg-gray-50 p-2 rounded text-sm">
                            {note}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    {selectedAction.status === 'PENDING' && (
                      <Button 
                        className="w-full"
                        onClick={() => handleStatusChange(selectedAction.id, 'IN_PROGRESS')}
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Démarrer l'action
                      </Button>
                    )}
                    
                    {selectedAction.status === 'IN_PROGRESS' && (
                      <div className="flex space-x-3">
                        <Button 
                          className="flex-1"
                          onClick={() => handleStatusChange(selectedAction.id, 'COMPLETED')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Terminer
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleStatusChange(selectedAction.id, 'ON_HOLD')}
                        >
                          <PauseCircle className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Sélectionnez une action
                </h3>
                <p className="text-gray-500">
                  Cliquez sur une action pour voir ses détails.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionsCockpit;
