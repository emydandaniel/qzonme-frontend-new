import { db } from './db';
import { quizzes, questions, quizAttempts } from '@shared/schema';
import { eq, lt, inArray, sql } from 'drizzle-orm';
import { cleanupOldQuizImages } from './cloudinary';
import { log } from './vite'; // Assuming log function is available

/**
 * Gets the cutoff date for quiz retention
 * @returns Date object for the cutoff (7 days ago)
 */
function getRetentionCutoffDate(): Date {
  const now = new Date();
  // Set cutoff to 7 days ago
  now.setDate(now.getDate() - 7);
  return now;
}

/**
 * Cleans up expired quizzes and their related data
 * - Deletes quizzes older than 7 days
 * - Deletes associated questions
 * - Deletes associated attempts
 * - Deletes associated images from Cloudinary
 * @returns Promise resolving to cleanup results
 */
export async function cleanupExpiredQuizzes() {
  try {
    log('Starting cleanup of expired quizzes...');
    const cutoffDate = getRetentionCutoffDate();
    const cutoffDateString = cutoffDate.toISOString(); // Convert to ISO string for SQLite comparison
    log(`Cutoff date for expired quizzes: ${cutoffDateString}`);
    
    // First, get all expired quizzes (older than 7 days)
    // Use the ISO string for comparison with the TEXT createdAt column in SQLite
    const expiredQuizzes = await db
      .select()
      .from(quizzes)
      .where(lt(quizzes.createdAt, cutoffDateString)); 
    
    log(`Found ${expiredQuizzes.length} expired quizzes to clean up`);
    
    if (expiredQuizzes.length === 0) {
      return { 
        success: true, 
        message: 'No expired quizzes found to clean up',
        count: 0 
      };
    }
    
    const expiredQuizIds = expiredQuizzes.map(quiz => quiz.id);
    
    // Clean up related images from Cloudinary
    try {
      log(`Cleaning up images for ${expiredQuizIds.length} expired quizzes...`);
      await cleanupOldQuizImages(expiredQuizIds);
    } catch (imageError) {
      log(`Error cleaning up images: ${imageError instanceof Error ? imageError.message : String(imageError)}`, 'cleanup');
      // Continue with database cleanup even if image cleanup fails
    }
    
    // Delete associated attempts
    const attemptDeleteResult = await db
      .delete(quizAttempts)
      .where(inArray(quizAttempts.quizId, expiredQuizIds)); // Use inArray directly as we know the array is not empty here
    
    log(`Deleted quiz attempts for expired quizzes`);
    
    // Delete associated questions
    const questionDeleteResult = await db
      .delete(questions)
      .where(inArray(questions.quizId, expiredQuizIds)); // Use inArray directly
    
    log(`Deleted questions for expired quizzes`);
    
    // Finally, delete the expired quizzes
    const quizDeleteResult = await db
      .delete(quizzes)
      .where(inArray(quizzes.id, expiredQuizIds)); // Use inArray directly
    
    log(`Deleted ${expiredQuizzes.length} expired quizzes`);
    
    return {
      success: true,
      message: `Cleaned up ${expiredQuizzes.length} expired quizzes`,
      count: expiredQuizzes.length,
      quizIds: expiredQuizIds
    };
  } catch (error) {
    log(`Error cleaning up expired quizzes: ${error instanceof Error ? error.message : String(error)}`, 'cleanup');
    return {
      success: false,
      error: String(error),
      message: 'Failed to clean up expired quizzes'
    };
  }
}

/**
 * Schedule the cleanup task to run daily
 * @param initialDelay Initial delay in milliseconds before first run
 * @returns The interval ID
 */
export function scheduleCleanupTask(initialDelay: number = 0) {
  log(`Scheduling daily cleanup task (initial delay: ${initialDelay}ms)`);
  
  // Run the task immediately after the initial delay
  const initialTimeoutId = setTimeout(async () => {
    log('Running initial cleanup task...');
    try {
      const result = await cleanupExpiredQuizzes();
      log(`Initial cleanup completed: ${JSON.stringify(result)}`);
    } catch (error) {
      log(`Error in initial cleanup: ${error instanceof Error ? error.message : String(error)}`, 'cleanup');
    }
    
    // Then schedule it to run daily (24 hours = 86400000ms)
    const intervalId = setInterval(async () => {
      log('Running scheduled cleanup task...');
      try {
        const result = await cleanupExpiredQuizzes();
        log(`Scheduled cleanup completed: ${JSON.stringify(result)}`);
      } catch (error) {
        log(`Error in scheduled cleanup: ${error instanceof Error ? error.message : String(error)}`, 'cleanup');
      }
    }, 86400000); // 24 hours
    
    // Store interval ID if needed for cleanup on server shutdown
    // For now, just return it
    return intervalId;
  }, initialDelay);
  
  return initialTimeoutId;
}

