const GroupPost = require('../models/GroupPost');
const Group = require('../models/Group');
const Pet = require('../models/Pet');

// Create a new group post
exports.createGroupPost = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const {
      type, title, content, images, videos, relatedPet,
      location, tags, priority, eventDetails, helpRequest,
      visibility
    } = req.body;

    const group = await Group.findById(groupId);
    if (!group || !group.isActive) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    const userMembership = group.members.find(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!userMembership || userMembership.status !== 'active') {
      return res.status(403).json({ message: 'You must be an active member to post in this group' });
    }

    // Check posting permissions
    if (!group.settings.allowMemberPosts && userMembership.role === 'member') {
      return res.status(403).json({ message: 'Only admins and moderators can post in this group' });
    }

    const post = new GroupPost({
      group: groupId,
      author: req.user._id,
      type,
      title,
      content,
      images: images || [],
      videos: videos || [],
      relatedPet,
      location,
      tags: tags || [],
      priority,
      eventDetails,
      helpRequest,
      visibility: visibility || 'members-only',
      status: group.settings.requireApproval && userMembership.role === 'member' ? 'pending-approval' : 'active'
    });

    await post.save();
    await post.populate([
      { path: 'author', select: 'name avatar organizationDetails' },
      { path: 'relatedPet', select: 'name breed category images' }
    ]);

    // Update group stats
    if (post.status === 'active') {
      await Group.findByIdAndUpdate(groupId, {
        $inc: { 'stats.totalPosts': 1 }
      });
    }

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    next(error);
  }
};

// Get group posts
exports.getGroupPosts = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const {
      type, priority, status = 'active',
      page = 1, limit = 10, sort = 'newest'
    } = req.query;

    const group = await Group.findById(groupId);
    if (!group || !group.isActive) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user can view posts
    const userMembership = group.members.find(
      member => member.user.toString() === req.user._id.toString()
    );

    if (group.privacy === 'private' && (!userMembership || userMembership.status !== 'active')) {
      return res.status(403).json({ message: 'You must be a member to view posts in this private group' });
    }

    let query = { group: groupId, status };

    // Filters
    if (type) query.type = type;
    if (priority) query.priority = priority;

    // Sorting
    let sortOptions = { isPinned: -1, createdAt: -1 };
    if (sort === 'popular') sortOptions = { isPinned: -1, 'engagement.likesCount': -1, createdAt: -1 };
    else if (sort === 'most-commented') sortOptions = { isPinned: -1, 'engagement.commentsCount': -1, createdAt: -1 };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await GroupPost.countDocuments(query);

    const posts = await GroupPost.find(query)
      .populate('author', 'name avatar organizationDetails')
      .populate('relatedPet', 'name breed category images status')
      .populate('comments.user', 'name avatar')
      .populate('likes.user', 'name avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      posts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single post
exports.getGroupPost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await GroupPost.findById(postId)
      .populate('author', 'name avatar organizationDetails location')
      .populate('group', 'name type category privacy')
      .populate('relatedPet')
      .populate('comments.user', 'name avatar')
      .populate('comments.replies.user', 'name avatar')
      .populate('likes.user', 'name avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user can view the post
    if (post.group.privacy === 'private') {
      const group = await Group.findById(post.group._id);
      const userMembership = group.members.find(
        member => member.user.toString() === req.user._id.toString()
      );

      if (!userMembership || userMembership.status !== 'active') {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Increment view count
    await GroupPost.findByIdAndUpdate(postId, {
      $inc: { 'engagement.views': 1 }
    });

    res.json({ post });
  } catch (error) {
    next(error);
  }
};

// Like/Unlike a post
exports.toggleLikePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await GroupPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === userId.toString()
    );

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push({ user: userId });
    }

    await post.save();

    res.json({
      message: likeIndex > -1 ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    next(error);
  }
};

// Add comment to post
exports.addComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;

    const post = await GroupPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (parentCommentId) {
      // Reply to a comment
      const parentComment = post.comments.id(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }

      parentComment.replies.push({
        user: req.user._id,
        content
      });
    } else {
      // New comment
      post.comments.push({
        user: req.user._id,
        content
      });
    }

    await post.save();
    await post.populate('comments.user comments.replies.user', 'name avatar');

    res.status(201).json({
      message: 'Comment added successfully',
      comments: post.comments
    });
  } catch (error) {
    next(error);
  }
};

// Delete comment
exports.deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    const post = await GroupPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user can delete (author or group admin/moderator)
    const group = await Group.findById(post.group);
    const isAuthor = comment.user.toString() === userId.toString();
    const isGroupAdmin = group.admins.includes(userId) || group.createdBy.toString() === userId.toString();
    const isGroupModerator = group.moderators.includes(userId);

    if (!isAuthor && !isGroupAdmin && !isGroupModerator) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    comment.remove();
    await post.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Update post
exports.updatePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const post = await GroupPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user can edit (author or group admin/moderator)
    const group = await Group.findById(post.group);
    const isAuthor = post.author.toString() === userId.toString();
    const isGroupAdmin = group.admins.includes(userId) || group.createdBy.toString() === userId.toString();
    const isGroupModerator = group.moderators.includes(userId);

    if (!isAuthor && !isGroupAdmin && !isGroupModerator) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Allowed fields to update
    const allowedUpdates = [
      'title', 'content', 'images', 'videos', 'tags',
      'priority', 'eventDetails', 'helpRequest'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        post[field] = updates[field];
      }
    });

    await post.save();
    await post.populate('author relatedPet', 'name avatar organizationDetails breed category images');

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    next(error);
  }
};

// Delete post
exports.deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await GroupPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user can delete (author or group admin/moderator)
    const group = await Group.findById(post.group);
    const isAuthor = post.author.toString() === userId.toString();
    const isGroupAdmin = group.admins.includes(userId) || group.createdBy.toString() === userId.toString();
    const isGroupModerator = group.moderators.includes(userId);

    if (!isAuthor && !isGroupAdmin && !isGroupModerator) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    await GroupPost.findByIdAndDelete(postId);

    // Update group stats
    await Group.findByIdAndUpdate(post.group, {
      $inc: { 'stats.totalPosts': -1 }
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Share a pet to group
exports.sharePetToGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { petId, message } = req.body;

    const group = await Group.findById(groupId);
    if (!group || !group.isActive) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Check if user is a member
    const userMembership = group.members.find(
      member => member.user.toString() === req.user._id.toString()
    );

    if (!userMembership || userMembership.status !== 'active') {
      return res.status(403).json({ message: 'You must be an active member to share pets in this group' });
    }

    const post = new GroupPost({
      group: groupId,
      author: req.user._id,
      type: 'pet-share',
      title: `${pet.name} needs a loving home!`,
      content: message || `Check out this adorable ${pet.breed} looking for adoption.`,
      relatedPet: petId,
      images: pet.images || [],
      priority: pet.urgency === 'high' ? 'high' : 'normal',
      status: 'active'
    });

    await post.save();
    await post.populate([
      { path: 'author', select: 'name avatar' },
      { path: 'relatedPet', select: 'name breed category age gender images status location' }
    ]);

    res.status(201).json({
      message: 'Pet shared to group successfully',
      post
    });
  } catch (error) {
    next(error);
  }
};

// Pin/Unpin post
exports.togglePinPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await GroupPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is group admin/moderator
    const group = await Group.findById(post.group);
    const isGroupAdmin = group.admins.includes(userId) || group.createdBy.toString() === userId.toString();
    const isGroupModerator = group.moderators.includes(userId);

    if (!isGroupAdmin && !isGroupModerator) {
      return res.status(403).json({ message: 'Only group admins and moderators can pin posts' });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.json({
      message: post.isPinned ? 'Post pinned successfully' : 'Post unpinned successfully',
      isPinned: post.isPinned
    });
  } catch (error) {
    next(error);
  }
};
