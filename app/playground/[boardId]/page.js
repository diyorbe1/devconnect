// app/playground/[boardId]/page.js
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, StickyNote, Code, CheckSquare, Lightbulb, Pencil, X } from "lucide-react";
import { useAuth } from '@/components/AuthProvider';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import ReactFlow, {
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom Node component
const CustomNode = ({ id, data }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(data.label);
  const [editedType, setEditedType] = useState(data.type);

  const handleUpdate = useCallback(async () => {
    if (editedContent.trim() === data.label && editedType === data.type) {
      setIsEditing(false);
      return;
    }

    const { error } = await supabase
      .from('blocks')
      .update({
        content: editedContent,
        type: editedType,
      })
      .eq('id', id);

    if (error) {
      console.error("Error updating block:", error);
    }
    setIsEditing(false);
  }, [id, data, editedContent, editedType]);

  const handleDoubleClick = () => {
    if (data.isOwner) {
      setIsEditing(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUpdate();
    }
  };
  
  const handleCancelEdit = () => {
    setEditedContent(data.label);
    setEditedType(data.type);
    setIsEditing(false);
  };

  const nodeIcons = {
    note: <StickyNote className="h-4 w-4 text-gray-500" />,
    code: <Code className="h-4 w-4 text-gray-500" />,
    task: <CheckSquare className="h-4 w-4 text-gray-500" />,
    idea: <Lightbulb className="h-4 w-4 text-gray-500" />,
  };

  return (
    <Card className="min-w-[250px] shadow-lg relative" onDoubleClick={handleDoubleClick}>
      {data.isOwner && (
        <div className="absolute -top-3 -right-3 flex items-center gap-1">
          {isEditing ? (
            <Button
              variant="secondary"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={handleCancelEdit}
              title="Cancel editing"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-full opacity-0 hover:opacity-100 transition-opacity"
              onClick={() => setIsEditing(true)}
              title="Edit block"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="destructive"
            size="icon"
            className="h-7 w-7 rounded-full opacity-0 hover:opacity-100 transition-opacity"
            onClick={() => data.onDelete(id)}
            title="Delete block"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {isEditing ? (
          <select
            value={editedType}
            onChange={(e) => setEditedType(e.target.value)}
            onBlur={handleUpdate}
            className="rounded-md border-gray-300 shadow-sm dark:bg-zinc-900 text-sm font-medium"
          >
            {Object.keys(nodeIcons).map((type) => (
              <option key={type} value={type}>{type.toUpperCase()}</option>
            ))}
          </select>
        ) : (
          <CardTitle className="text-sm text-gray-500 font-medium flex items-center gap-2">
            {nodeIcons[data.type]} {data.type.toUpperCase()}
          </CardTitle>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            onBlur={handleUpdate}
            onKeyDown={handleKeyDown}
            className="w-full text-base dark:bg-zinc-900"
            autoFocus
          />
        ) : (
          <p className="text-base">{data.label}</p>
        )}
      </CardContent>
    </Card>
  );
};

const nodeTypes = { custom: CustomNode };

export default function BoardPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = params.boardId;

  const { session } = useAuth();
  const [board, setBoard] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [newBlockContent, setNewBlockContent] = useState('');
  
  const sessionRef = useRef(session);
  const boardRef = useRef(board);
  
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  const handleDeleteBlock = useCallback(async (blockId) => {
    if (!sessionRef.current || sessionRef.current.user.id !== boardRef.current?.user_id?.id) {
      alert("You are not authorized to delete this block.");
      return;
    }
    if (window.confirm("Bu blokni o'chirishga ishonchingiz komilmi?")) {
      const { error } = await supabase
        .from('blocks')
        .delete()
        .eq('id', blockId);
      if (error) {
        console.error("Error deleting block:", error);
      }
    }
  }, []);

  const handleCreateBlock = useCallback(async (type, content, position) => {
    if (!content.trim() || !sessionRef.current || !boardId) {
      alert("Iltimos, blok mazmunini kiriting va tizimga kirganingizga ishonch hosil qiling.");
      return;
    }

    const { error } = await supabase
      .from('blocks')
      .insert({
        board_id: boardId,
        content: content,
        type: type,
        position_x: position?.x || 50,
        position_y: position?.y || 50,
      });

    if (error) {
      console.error("Error creating block:", error);
    } else {
      setNewBlockContent('');
    }
  }, [boardId]);

  const fetchBoardData = useCallback(async () => {
    if (!boardId) return;

    const { data: boardData, error: boardError } = await supabase
      .from('boards')
      .select(`*, user_id (id, full_name, username)`)
      .eq('id', boardId)
      .single();

    if (boardError) {
      console.error('Error fetching board:', boardError);
      router.push('/playground');
      return;
    }
    setBoard(boardData);

    const { data: blocksData, error: blocksError } = await supabase
      .from('blocks')
      .select('*')
      .eq('board_id', boardId)
      .order('created_at', { ascending: false });

    if (blocksError) {
      console.error('Error fetching blocks:', blocksError);
    }

    const isOwner = sessionRef.current?.user?.id === boardData?.user_id?.id;
    const initialNodes = (blocksData || []).map(block => ({
      id: block.id,
      type: 'custom',
      position: { x: block.position_x || 0, y: block.position_y || 0 },
      data: { label: block.content, type: block.type, isOwner, onDelete: handleDeleteBlock },
    }));
    setNodes(initialNodes);
  }, [boardId, router, setNodes, handleDeleteBlock]);

  useEffect(() => {
    fetchBoardData();

    if (!boardId) return;

    const channel = supabase
      .channel(`board-${boardId}-changes`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blocks', filter: `board_id=eq.${boardId}` },
        (payload) => {
          setNodes((currentNodes) => {
            const isOwner = sessionRef.current?.user?.id === boardRef.current?.user_id?.id;
            if (payload.eventType === 'INSERT') {
              const newNode = {
                id: payload.new.id,
                type: 'custom',
                position: { x: payload.new.position_x || 0, y: payload.new.position_y || 0 },
                data: { label: payload.new.content, type: payload.new.type, isOwner, onDelete: handleDeleteBlock },
              };
              return [...currentNodes, newNode];
            } else if (payload.eventType === 'UPDATE') {
              return currentNodes.map(node =>
                node.id === payload.new.id
                  ? {
                      ...node,
                      position: { x: payload.new.position_x, y: payload.new.position_y },
                      data: { ...node.data, label: payload.new.content, type: payload.new.type },
                    }
                  : node
              );
            } else if (payload.eventType === 'DELETE') {
              return currentNodes.filter(node => node.id !== payload.old.id);
            }
            return currentNodes;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId, fetchBoardData, handleDeleteBlock, setNodes]);

  const onNodeDragStop = useCallback(
    async (event, node) => {
      if (!sessionRef.current || sessionRef.current.user.id !== boardRef.current?.user_id?.id) {
        return;
      }
      await supabase
        .from('blocks')
        .update({
          position_x: node.position.x,
          position_y: node.position.y
        })
        .eq('id', node.id);
    },
    []
  );
  
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    async (event) => {
      event.preventDefault();
      const reactFlowBounds = event.target.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      const content = event.dataTransfer.getData('text/plain');

      if (!type || !content) return;

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      handleCreateBlock(type, content, position);
    },
    [handleCreateBlock]
  );

  if (!board) {
    return <div className="text-center p-10">Loading...</div>;
  }

  const isOwner = session?.user?.id === board?.user_id?.id;

  const nodeIcons = {
    note: <StickyNote className="h-4 w-4" />,
    code: <Code className="h-4 w-4" />,
    task: <CheckSquare className="h-4 w-4" />,
    idea: <Lightbulb className="h-4 w-4" />,
  };

  const onDragStart = (event, nodeType, content) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('text/plain', content);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-gray-100 dark:bg-zinc-800 p-4 border-b border-gray-200 dark:border-zinc-700 flex items-center justify-between">
        <h1 className="text-xl font-bold">{board.title}</h1>
        {isOwner && (
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Block
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Add a new block</h4>
                    <p className="text-sm text-gray-500">
                      Create a new block and drag it to the canvas.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={newBlockContent}
                      onChange={(e) => setNewBlockContent(e.target.value)}
                      placeholder="Enter block content here..."
                    />
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    {Object.keys(nodeIcons).map((type) => (
                      <TooltipProvider key={type}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              draggable
                              onDragStart={(event) => onDragStart(event, type, newBlockContent || type)}
                              onClick={() => handleCreateBlock(type, newBlockContent || type)}
                              className="cursor-grab"
                            >
                              {nodeIcons[type]}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{type.charAt(0).toUpperCase() + type.slice(1)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      <div className="flex-grow w-full h-full" onDragOver={onDragOver} onDrop={onDrop}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}