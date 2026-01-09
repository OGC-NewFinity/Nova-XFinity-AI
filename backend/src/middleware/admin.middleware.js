/**
 * Admin Middleware
 * Restricts access to admin-only routes
 */

import { authenticate } from './auth.middleware.js';
import prisma from '../config/database.js';

/**
 * Require admin role
 * Must be used after authenticate middleware
 * Fetches user role from database if not present in JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }

  // Get role from JWT token (should be set by authenticate middleware)
  let userRole = req.user.role;
  
  // If role is not in JWT token, try to fetch from database
  // Note: User role might be managed by FastAPI backend-auth service
  // If Prisma schema doesn't have role field, this will fail gracefully
  if (!userRole) {
    try {
      // Try to fetch from local database (if role field exists)
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { role: true }
      });
      
      if (user && user.role) {
        userRole = user.role;
        req.user.role = userRole;
      } else {
        // Role not in database either - default to 'user' and deny admin access
        console.warn(`User ${req.user.id} has no role in JWT or database. Defaulting to 'user'.`);
        userRole = 'user';
        req.user.role = userRole;
      }
    } catch (error) {
      // If Prisma schema doesn't have role field, or other DB error, 
      // fall back to role from JWT or default to 'user'
      console.warn('Could not fetch user role from database (may not have role field):', error.message);
      if (!userRole) {
        userRole = 'user'; // Default to non-admin
        req.user.role = userRole;
      }
    }
  }

  if (userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required'
      }
    });
  }

  next();
};

/**
 * Combined middleware: authenticate + require admin
 * Use this for admin-only routes
 */
export const authenticateAdmin = [authenticate, requireAdmin];
