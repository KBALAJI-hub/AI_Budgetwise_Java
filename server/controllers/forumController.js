const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createPost = async (req, res, next) => {
    try {
        const { title, content } = req.body;
        const post = await prisma.post.create({
            data: { title, content, userId: req.userId }
        });
        res.status(201).json(post);
    } catch (err) { next(err); }
};

const getPosts = async (req, res, next) => {
    try {
        const posts = await prisma.post.findMany({
            include: { user: { select: { fullName: true } }, comments: { include: { user: { select: { fullName: true } } } }, likes: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(posts);
    } catch (err) { next(err); }
};

const addComment = async (req, res, next) => {
    try {
        const { postId, comment } = req.body;
        const parsedPostId = parseInt(postId, 10);
        const newComment = await prisma.comment.create({
            data: { postId: parsedPostId, comment, userId: req.userId }
        });
        res.status(201).json(newComment);
    } catch (err) { next(err); }
};

const likePost = async (req, res, next) => {
    try {
        const { postId } = req.body;
        const parsedPostId = parseInt(postId, 10);
        const existingLike = await prisma.like.findUnique({
            where: { userId_postId: { userId: req.userId, postId: parsedPostId } }
        });
        if (existingLike) {
            return res.status(400).json({ message: 'Already liked this post' });
        }
        await prisma.like.create({
            data: { userId: req.userId, postId: parsedPostId }
        });
        await prisma.post.update({
            where: { id: parsedPostId },
            data: { likesCount: { increment: 1 } }
        });
        res.status(200).json({ message: 'Post liked successfully' });
    } catch (err) { next(err); }
};

module.exports = { createPost, getPosts, addComment, likePost };
