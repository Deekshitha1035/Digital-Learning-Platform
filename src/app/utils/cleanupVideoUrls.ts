/**
 * Cleanup utility to fix video URLs in localStorage
 * Removes any invalid video URLs that cause NotSupportedError
 */

export function cleanupVideoUrls() {
  try {
    const keys = Object.keys(localStorage);
    let cleanedCount = 0;

    keys.forEach(key => {
      if (key.startsWith('lesson-')) {
        try {
          const lessonData = localStorage.getItem(key);
          if (lessonData) {
            const lesson = JSON.parse(lessonData);
            
            // Check if videoUrl is invalid (external URL that won't load)
            if (lesson.videoUrl && (
              lesson.videoUrl.includes('commondatastorage.googleapis.com') ||
              lesson.videoUrl.includes('example.com') ||
              lesson.videoUrl.startsWith('https://') && !lesson.videoUrl.includes('blob:')
            )) {
              // Replace with empty string to prevent errors
              lesson.videoUrl = '';
              lesson.thumbnailUrl = undefined;
              localStorage.setItem(key, JSON.stringify(lesson));
              cleanedCount++;
            }
          }
        } catch (error) {
          console.log(`Skipping invalid lesson data: ${key}`);
        }
      }
    });

    if (cleanedCount > 0) {
      console.log(`✅ Cleaned up ${cleanedCount} lessons with invalid video URLs`);
    }
  } catch (error) {
    console.error('Error cleaning up video URLs:', error);
  }
}

// Auto-cleanup on module load
if (typeof window !== 'undefined') {
  cleanupVideoUrls();
}
