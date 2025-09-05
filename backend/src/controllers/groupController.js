const Group = require('../models/Group');
const GroupPost = require('../models/GroupPost');
const User = require('../models/User');

// Create a new group
exports.createGroup = async (req, res, next) => {
  try {
    const {
      name, description, type, category, privacy, location,
      tags, rules, settings, contactInfo
    } = req.body;

    // Create the group
    const group = new Group({
      name,
      description,
      type,
      category,
      privacy,
      location,
      tags: tags || [],
      rules: rules || [],
      settings: {
        allowMemberPosts: settings?.allowMemberPosts ?? true,
        requireApproval: settings?.requireApproval ?? false,
        allowInvites: settings?.allowInvites ?? true,
        allowFileUploads: settings?.allowFileUploads ?? true,
        maxMembersLimit: settings?.maxMembersLimit || 0
      },
      contactInfo: contactInfo || {},
      createdBy: req.user._id,
      admins: [req.user._id],
      members: [{
        user: req.user._id,
        role: 'admin',
        status: 'active',
        joinedAt: new Date()
      }]
    });

    await group.save();

    // Add group to user's groups
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        groups: {
          group: group._id,
          role: 'admin',
          status: 'active'
        }
      }
    });

    await group.populate('createdBy', 'name email avatar organizationDetails');
    
    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    next(error);
  }
};

// Get all groups with filters
exports.getAllGroups = async (req, res, next) => {
  try {
    const {
      type, category, privacy, search, location,
      page = 1, limit = 12, sort = 'newest'
    } = req.query;

    let query = { isActive: true };

    // Filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (privacy) query.privacy = privacy;
    if (location) {
      query.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } }
      ];
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'popular') sortOptions = { memberCount: -1, createdAt: -1 };
    else if (sort === 'members') sortOptions = { memberCount: -1 };
    else if (sort === 'alphabetical') sortOptions = { name: 1 };

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Group.countDocuments(query);

    const groups = await Group.find(query)
      .populate('createdBy', 'name avatar organizationDetails')
      .populate('members.user', 'name avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-members.user.email -members.user.phone'); // Don't expose sensitive info

    res.json({
      groups,
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

// Get single group by ID
exports.getGroupById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const group = await Group.findById(id)
      .populate('createdBy', 'name email avatar organizationDetails location')
      .populate('admins', 'name avatar organizationDetails')
      .populate('moderators', 'name avatar organizationDetails')
      .populate('members.user', 'name avatar organizationDetails joinedAt');

    if (!group || !group.isActive) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    let userMembership = null;
    if (userId) {
      userMembership = group.members.find(
        member => member.user._id.toString() === userId.toString()
      );
    }

    // If group is private and user is not a member, limit information
    if (group.privacy === 'private' && !userMembership) {
      return res.json({
        group: {
          _id: group._id,
          name: group.name,
          description: group.description,
          type: group.type,
          category: group.category,
          privacy: group.privacy,
          memberCount: group.memberCount,
          createdBy: group.createdBy,
          createdAt: group.createdAt,
          isPrivate: true
        },
        userMembership: null
      });
    }

    res.json({
      group,
      userMembership
    });
  } catch (error) {
    next(error);
  }
};

// Join a group
exports.joinGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group || !group.isActive) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is already a member
    const existingMember = group.members.find(
      member => member.user.toString() === userId.toString()
    );

    if (existingMember) {
      if (existingMember.status === 'active') {
        return res.status(400).json({ message: 'You are already a member of this group' });
      } else if (existingMember.status === 'pending') {
        return res.status(400).json({ message: 'Your membership request is pending approval' });
      } else if (existingMember.status === 'banned') {
        return res.status(403).json({ message: 'You are banned from this group' });
      }
    }

    // Check member limit
    if (group.settings.maxMembersLimit > 0 && group.memberCount >= group.settings.maxMembersLimit) {
      return res.status(400).json({ message: 'Group has reached maximum member limit' });
    }

    const memberStatus = group.settings.requireApproval ? 'pending' : 'active';

    if (existingMember) {
      // Update existing member
      existingMember.status = memberStatus;
      existingMember.joinedAt = new Date();
    } else {
      // Add new member
      group.members.push({
        user: userId,
        role: 'member',
        status: memberStatus,
        joinedAt: new Date()
      });
    }

    await group.save();

    // Add to user's groups
    const user = await User.findById(userId);
    const userGroupIndex = user.groups.findIndex(
      g => g.group.toString() === id
    );

    if (userGroupIndex >= 0) {
      user.groups[userGroupIndex].status = memberStatus;
    } else {
      user.groups.push({
        group: id,
        role: 'member',
        status: memberStatus
      });
    }

    await user.save();

    const message = memberStatus === 'pending' 
      ? 'Membership request sent successfully'
      : 'Joined group successfully';

    res.json({ message, status: memberStatus });
  } catch (error) {
    next(error);
  }
};

// Leave a group
exports.leaveGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the creator
    if (group.createdBy.toString() === userId.toString()) {
      return res.status(400).json({ 
        message: 'Group creator cannot leave. Transfer ownership or delete the group.' 
      });
    }

    // Remove from group members
    group.members = group.members.filter(
      member => member.user.toString() !== userId.toString()
    );

    // Remove from admins and moderators if present
    group.admins = group.admins.filter(
      admin => admin.toString() !== userId.toString()
    );
    group.moderators = group.moderators.filter(
      mod => mod.toString() !== userId.toString()
    );

    await group.save();

    // Remove from user's groups
    await User.findByIdAndUpdate(userId, {
      $pull: { groups: { group: id } }
    });

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    next(error);
  }
};

// Get user's groups
exports.getUserGroups = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status = 'active' } = req.query;

    const user = await User.findById(userId)
      .populate({
        path: 'groups.group',
        match: { isActive: true },
        populate: {
          path: 'createdBy',
          select: 'name avatar'
        }
      });

    const userGroups = user.groups
      .filter(g => g.group && g.status === status)
      .map(g => ({
        ...g.group.toObject(),
        userRole: g.role,
        userStatus: g.status,
        joinedAt: g.joinedAt
      }));

    res.json({ groups: userGroups });
  } catch (error) {
    next(error);
  }
};

// Update group
exports.updateGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const group = await Group.findById(id);
    if (!group || !group.isActive) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    const isAdmin = group.admins.includes(userId) || group.createdBy.toString() === userId.toString();
    if (!isAdmin) {
      return res.status(403).json({ message: 'Only group admins can update group details' });
    }

    // Allowed fields to update
    const allowedUpdates = [
      'name', 'description', 'category', 'privacy', 'location',
      'tags', 'rules', 'settings', 'contactInfo', 'avatar', 'coverImage'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        group[field] = updates[field];
      }
    });

    await group.save();
    await group.populate('createdBy admins moderators', 'name avatar organizationDetails');

    res.json({
      message: 'Group updated successfully',
      group
    });
  } catch (error) {
    next(error);
  }
};

// Delete group
exports.deleteGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Only creator can delete group
    if (group.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only group creator can delete the group' });
    }

    // Mark as inactive instead of deleting
    group.isActive = false;
    await group.save();

    // Remove from all users' groups
    await User.updateMany(
      { 'groups.group': id },
      { $pull: { groups: { group: id } } }
    );

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Manage group members (approve, reject, ban, promote, demote)
exports.manageGroupMember = async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params;
    const { action, role } = req.body; // action: approve, reject, ban, unban, promote, demote
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group || !group.isActive) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user has permission
    const isCreator = group.createdBy.toString() === userId.toString();
    const isAdmin = group.admins.includes(userId);
    const isModerator = group.moderators.includes(userId);

    if (!isCreator && !isAdmin && !isModerator) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const memberIndex = group.members.findIndex(
      member => member.user.toString() === memberId
    );

    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const member = group.members[memberIndex];

    switch (action) {
      case 'approve':
        if (member.status === 'pending') {
          member.status = 'active';
          await User.findOneAndUpdate(
            { _id: memberId, 'groups.group': groupId },
            { $set: { 'groups.$.status': 'active' } }
          );
        }
        break;

      case 'reject':
        if (member.status === 'pending') {
          group.members.splice(memberIndex, 1);
          await User.findByIdAndUpdate(memberId, {
            $pull: { groups: { group: groupId } }
          });
        }
        break;

      case 'ban':
        if (!isCreator && member.role === 'admin') {
          return res.status(403).json({ message: 'Cannot ban an admin' });
        }
        member.status = 'banned';
        await User.findOneAndUpdate(
          { _id: memberId, 'groups.group': groupId },
          { $set: { 'groups.$.status': 'banned' } }
        );
        break;

      case 'unban':
        member.status = 'active';
        await User.findOneAndUpdate(
          { _id: memberId, 'groups.group': groupId },
          { $set: { 'groups.$.status': 'active' } }
        );
        break;

      case 'promote':
        if (isCreator || isAdmin) {
          if (role === 'moderator' && member.role === 'member') {
            member.role = 'moderator';
            group.moderators.push(memberId);
          } else if (role === 'admin' && isCreator) {
            member.role = 'admin';
            group.admins.push(memberId);
            group.moderators = group.moderators.filter(id => id.toString() !== memberId);
          }
          await User.findOneAndUpdate(
            { _id: memberId, 'groups.group': groupId },
            { $set: { 'groups.$.role': member.role } }
          );
        }
        break;

      case 'demote':
        if (isCreator || isAdmin) {
          if (member.role === 'moderator') {
            member.role = 'member';
            group.moderators = group.moderators.filter(id => id.toString() !== memberId);
          } else if (member.role === 'admin' && isCreator) {
            member.role = 'member';
            group.admins = group.admins.filter(id => id.toString() !== memberId);
          }
          await User.findOneAndUpdate(
            { _id: memberId, 'groups.group': groupId },
            { $set: { 'groups.$.role': member.role } }
          );
        }
        break;

      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    await group.save();
    res.json({ message: `Member ${action}d successfully` });
  } catch (error) {
    next(error);
  }
};

// Get group statistics
exports.getGroupStats = async (req, res, next) => {
  try {
    const totalGroups = await Group.countDocuments({ isActive: true });
    const groupsByType = await Group.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const groupsByCategory = await Group.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      totalGroups,
      groupsByType,
      groupsByCategory
    });
  } catch (error) {
    next(error);
  }
};
