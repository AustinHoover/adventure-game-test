export interface TicketOption<T = any> {
  value: T;
  tickets: number;
}

export class TicketSystem<T = any> {
  private options: TicketOption<T>[] = [];
  private totalTickets: number = 0;

  /**
   * Add an option with a specified number of tickets
   * @param value - The option value
   * @param tickets - Number of tickets for this option (must be positive)
   */
  addOption(value: T, tickets: number): void {
    if (tickets <= 0) {
      throw new Error('Ticket count must be positive');
    }
    
    this.options.push({ value, tickets });
    this.totalTickets += tickets;
  }

  /**
   * Remove an option by value
   * @param value - The option value to remove
   * @returns true if option was found and removed, false otherwise
   */
  removeOption(value: T): boolean {
    const index = this.options.findIndex(option => option.value === value);
    if (index !== -1) {
      const removedOption = this.options.splice(index, 1)[0];
      this.totalTickets -= removedOption.tickets;
      return true;
    }
    return false;
  }

  /**
   * Update the number of tickets for an existing option
   * @param value - The option value to update
   * @param newTickets - New number of tickets (must be positive)
   * @returns true if option was found and updated, false otherwise
   */
  updateTickets(value: T, newTickets: number): boolean {
    if (newTickets <= 0) {
      throw new Error('Ticket count must be positive');
    }

    const option = this.options.find(opt => opt.value === value);
    if (option) {
      this.totalTickets -= option.tickets;
      option.tickets = newTickets;
      this.totalTickets += newTickets;
      return true;
    }
    return false;
  }

  /**
   * Get a random option based on ticket distribution
   * @returns The selected option value, or null if no options exist
   */
  selectRandom(): T | null {
    if (this.options.length === 0 || this.totalTickets === 0) {
      return null;
    }

    const randomTicket = Math.random() * this.totalTickets;
    let currentTicketCount = 0;

    for (const option of this.options) {
      currentTicketCount += option.tickets;
      if (randomTicket <= currentTicketCount) {
        return option.value;
      }
    }

    // Fallback to last option (shouldn't happen with proper math, but safety)
    return this.options[this.options.length - 1]?.value || null;
  }

  /**
   * Get multiple random selections (with replacement)
   * @param count - Number of selections to make
   * @returns Array of selected values
   */
  selectMultiple(count: number): T[] {
    const results: T[] = [];
    for (let i = 0; i < count; i++) {
      const result = this.selectRandom();
      if (result !== null) {
        results.push(result);
      }
    }
    return results;
  }

  /**
   * Get multiple random selections (without replacement)
   * @param count - Number of selections to make
   * @returns Array of selected values
   */
  selectMultipleWithoutReplacement(count: number): T[] {
    if (count > this.options.length) {
      throw new Error('Cannot select more items than available options without replacement');
    }

    const results: T[] = [];
    const tempSystem = new TicketSystem<T>();
    
    // Create a temporary copy of the system
    for (const option of this.options) {
      tempSystem.addOption(option.value, option.tickets);
    }

    for (let i = 0; i < count; i++) {
      const result = tempSystem.selectRandom();
      if (result !== null) {
        results.push(result);
        tempSystem.removeOption(result);
      }
    }

    return results;
  }

  /**
   * Get all current options and their ticket counts
   * @returns Array of ticket options
   */
  getOptions(): TicketOption<T>[] {
    return [...this.options];
  }

  /**
   * Get the total number of tickets
   * @returns Total ticket count
   */
  getTotalTickets(): number {
    return this.totalTickets;
  }

  /**
   * Get the number of options
   * @returns Number of options
   */
  getOptionCount(): number {
    return this.options.length;
  }

  /**
   * Clear all options
   */
  clear(): void {
    this.options = [];
    this.totalTickets = 0;
  }

  /**
   * Check if the system has any options
   * @returns true if there are options, false otherwise
   */
  isEmpty(): boolean {
    return this.options.length === 0;
  }
}

/**
 * Utility function to create a ticket system from an array of options
 * @param options - Array of ticket options
 * @returns New TicketSystem instance
 */
export function createTicketSystem<T>(options: TicketOption<T>[]): TicketSystem<T> {
  const system = new TicketSystem<T>();
  for (const option of options) {
    system.addOption(option.value, option.tickets);
  }
  return system;
}

/**
 * Utility function to create a ticket system from a simple value-ticket mapping
 * @param ticketMap - Object mapping values to ticket counts
 * @returns New TicketSystem instance
 */
export function createTicketSystemFromMap<T>(ticketMap: Record<string, number>): TicketSystem<T> {
  const system = new TicketSystem<T>();
  for (const [key, tickets] of Object.entries(ticketMap)) {
    system.addOption(key as T, tickets);
  }
  return system;
}
