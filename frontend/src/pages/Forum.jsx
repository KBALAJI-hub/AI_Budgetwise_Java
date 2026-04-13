import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Avatar, Divider, IconButton, CircularProgress } from '@mui/material';
import { ThumbUp, ThumbUpOutlined, Comment as CommentIcon } from '@mui/icons-material';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ForumPage = () => {
    const [posts, setPosts] = useState([]);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    
    const [commentInputs, setCommentInputs] = useState({});

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/forum/posts');
            setPosts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            await api.post('/forum/posts', { title: newTitle, content: newContent });
            setNewTitle('');
            setNewContent('');
            fetchPosts();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddComment = async (postId) => {
        const comment = commentInputs[postId];
        if (!comment) return;
        try {
            await api.post('/forum/comments', { postId, comment });
            setCommentInputs({ ...commentInputs, [postId]: '' });
            fetchPosts();
        } catch (err) {
            console.error(err);
        }
    };

    const handleLike = async (postId) => {
        try {
            await api.post('/forum/like', { postId });
            fetchPosts();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>;

    return (
        <Box maxWidth="800px" margin="auto">
            <Typography variant="h4" fontWeight={700} mb={4}>Community Forum</Typography>
            
            <Card sx={{ mb: 4, p: 2, borderRadius: 3, background: 'rgba(255,255,255,0.05)' }}>
                <Typography variant="h6" mb={2}>Create a Post</Typography>
                <form onSubmit={handleCreatePost}>
                    <TextField fullWidth label="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required margin="normal" />
                    <TextField fullWidth label="Content" value={newContent} onChange={(e) => setNewContent(e.target.value)} required multiline rows={3} margin="normal" />
                    <Button type="submit" variant="contained" sx={{ mt: 2, borderRadius: 2 }}>Post</Button>
                </form>
            </Card>

            <Box>
                {posts.map(post => {
                    const hasLiked = post.likes.some(l => l.userId === user?.id);
                    return (
                        <Card key={post.id} sx={{ mb: 3, borderRadius: 3, background: 'rgba(255,255,255,0.03)' }}>
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={2} mb={2}>
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>{post.user?.fullName?.[0] || 'U'}</Avatar>
                                    <Box>
                                        <Typography fontWeight={700}>{post.user?.fullName || 'Unknown'}</Typography>
                                        <Typography variant="caption" color="text.secondary">{new Date(post.createdAt).toLocaleDateString()}</Typography>
                                    </Box>
                                </Box>
                                <Typography variant="h6" fontWeight={700} mb={1}>{post.title}</Typography>
                                <Typography variant="body1" mb={3}>{post.content}</Typography>
                                
                                <Box display="flex" alignItems="center" gap={3} mb={2}>
                                    <IconButton onClick={() => handleLike(post.id)} color={hasLiked ? "primary" : "default"}>
                                        {hasLiked ? <ThumbUp /> : <ThumbUpOutlined />}
                                    </IconButton>
                                    <Typography>{post.likesCount} Likes</Typography>
                                    
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <CommentIcon color="action" />
                                        <Typography>{post.comments.length} Comments</Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {post.comments.map(c => (
                                    <Box key={c.id} mb={2}>
                                        <Typography variant="subtitle2" fontWeight={700}>{c.user?.fullName || 'Unknown'}</Typography>
                                        <Typography variant="body2">{c.comment}</Typography>
                                    </Box>
                                ))}

                                <Box display="flex" gap={2} mt={2}>
                                    <TextField 
                                        size="small" 
                                        fullWidth 
                                        placeholder="Add a comment..." 
                                        value={commentInputs[post.id] || ''}
                                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                                    />
                                    <Button variant="outlined" onClick={() => handleAddComment(post.id)}>Reply</Button>
                                </Box>
                            </CardContent>
                        </Card>
                    );
                })}
            </Box>
        </Box>
    );
};

export default ForumPage;
