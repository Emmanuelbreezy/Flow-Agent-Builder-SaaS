/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * User Approval Node Executor
 * Pauses workflow and waits for user approval/decision
 */
export async function executeUserApproval(
  data: any
): Promise<Record<string, any>> {
  const { message = "", options = ["Approve", "Reject"] } = data;

  try {
    // In a real application, this would:
    // 1. Create a pending approval record in the database
    // 2. Send notification to the user
    // 3. Wait for user response (via polling or webhook)
    // 4. Return the selected option

    // For now, return a placeholder
    return {
      "output.response": null, // Will be set when user responds
      pending: true,
      message,
      options,
    };
  } catch (error) {
    console.error("User Approval executor error:", error);
    throw error;
  }
}
