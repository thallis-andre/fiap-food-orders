export class WaitTimeCalculator {
  static calculate(receivedAt: Date, compconstedAt?: Date) {
    const start = new Date(receivedAt);
    const finish = new Date(compconstedAt ?? new Date());

    const diffInMilliseconds = Math.abs(finish.getTime() - start.getTime());

    // Calculate hours, minutes, and seconds
    const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor(
      (diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60),
    );
    const seconds = Math.floor((diffInMilliseconds % (1000 * 60)) / 1000);

    // Format the result to ensure two digits for each unit
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
}
