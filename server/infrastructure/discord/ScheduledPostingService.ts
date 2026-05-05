import pino from "pino";
import { ChannelPostingService } from "./ChannelPostingService";

const logger = pino();

export interface ScheduledPost {
  id: string;
  guildId: string;
  channelId: string;
  type: "showcase" | "announcement" | "promotion";
  scheduledTime: Date;
  data: Record<string, any>;
  status: "pending" | "sent" | "failed";
  createdAt: Date;
  sentAt?: Date;
  errorMessage?: string;
}

export class ScheduledPostingService {
  private channelPostingService: ChannelPostingService;
  private queue: Map<string, ScheduledPost> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.channelPostingService = new ChannelPostingService();
    this.startQueueProcessor();
  }

  /**
   * Schedule a post for a specific time
   */
  schedulePost(post: Omit<ScheduledPost, "id" | "createdAt" | "status">): ScheduledPost {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const scheduledPost: ScheduledPost = {
      ...post,
      id,
      status: "pending",
      createdAt: new Date(),
    };

    this.queue.set(id, scheduledPost);
    this.schedulePostExecution(scheduledPost);

    logger.info(
      { postId: id, scheduledTime: post.scheduledTime },
      "[ScheduledPosting] Post scheduled"
    );

    return scheduledPost;
  }

  /**
   * Schedule multiple posts at specific times
   */
  scheduleRecurringPosts(
    guildId: string,
    channelId: string,
    type: "showcase" | "announcement" | "promotion",
    data: Record<string, any>,
    times: string[] // Array of times like ["10:00", "14:00", "18:00"]
  ): ScheduledPost[] {
    const today = new Date();
    const posts: ScheduledPost[] = [];

    times.forEach((time) => {
      const [hours, minutes] = time.split(":").map(Number);
      const scheduledTime = new Date(today);
      scheduledTime.setHours(hours, minutes, 0, 0);

      // If time has already passed today, schedule for tomorrow
      if (scheduledTime < new Date()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      const post = this.schedulePost({
        guildId,
        channelId,
        type,
        scheduledTime,
        data,
      });

      posts.push(post);
    });

    logger.info(
      { guildId, count: posts.length },
      "[ScheduledPosting] Recurring posts scheduled"
    );

    return posts;
  }

  /**
   * Get all scheduled posts
   */
  getScheduledPosts(): ScheduledPost[] {
    return Array.from(this.queue.values());
  }

  /**
   * Get pending posts
   */
  getPendingPosts(): ScheduledPost[] {
    return Array.from(this.queue.values()).filter((p) => p.status === "pending");
  }

  /**
   * Cancel a scheduled post
   */
  cancelPost(postId: string): boolean {
    const post = this.queue.get(postId);
    if (!post) return false;

    const timer = this.timers.get(postId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(postId);
    }

    this.queue.delete(postId);
    logger.info({ postId }, "[ScheduledPosting] Post cancelled");
    return true;
  }

  /**
   * Private method to schedule post execution
   */
  private schedulePostExecution(post: ScheduledPost): void {
    const now = new Date().getTime();
    const scheduledTime = new Date(post.scheduledTime).getTime();
    const delay = Math.max(0, scheduledTime - now);

    const timer = setTimeout(async () => {
      await this.executePost(post);
    }, delay);

    this.timers.set(post.id, timer);
  }

  /**
   * Private method to execute a scheduled post
   */
  private async executePost(post: ScheduledPost): Promise<void> {
    try {
      logger.info({ postId: post.id, type: post.type }, "[ScheduledPosting] Executing post");

      switch (post.type) {
        case "showcase":
          await this.channelPostingService.postProductShowcase({
            guildId: post.guildId,
            showcaseChannelId: post.channelId,
            products: post.data.products,
          });
          break;

        case "announcement":
          await this.channelPostingService.postAnnouncement({
            guildId: post.guildId,
            announcementChannelId: post.channelId,
            title: post.data.title,
            description: post.data.description,
            imageUrl: post.data.imageUrl,
            color: post.data.color,
          });
          break;

        case "promotion":
          await this.channelPostingService.postPromotion({
            guildId: post.guildId,
            promotionChannelId: post.channelId,
            title: post.data.title,
            discount: post.data.discount,
            products: post.data.products,
            endDate: post.data.endDate,
          });
          break;
      }

      // Update post status
      post.status = "sent";
      post.sentAt = new Date();
      this.queue.set(post.id, post);

      logger.info({ postId: post.id }, "[ScheduledPosting] Post executed successfully");
    } catch (error) {
      logger.error(
        { postId: post.id, error },
        "[ScheduledPosting] Failed to execute post"
      );

      // Update post status
      post.status = "failed";
      post.errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.queue.set(post.id, post);
    }
  }

  /**
   * Start queue processor to handle pending posts
   */
  private startQueueProcessor(): void {
    // Check queue every minute for posts that should be executed
    setInterval(() => {
      const now = new Date().getTime();
      const pendingPosts = this.getPendingPosts();

      pendingPosts.forEach((post) => {
        const scheduledTime = new Date(post.scheduledTime).getTime();
        if (scheduledTime <= now) {
          this.executePost(post);
        }
      });
    }, 60000); // Check every minute

    logger.info("[ScheduledPosting] Queue processor started");
  }
}
