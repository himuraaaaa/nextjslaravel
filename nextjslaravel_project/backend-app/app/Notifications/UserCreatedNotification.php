<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserCreatedNotification extends Notification
{
    use Queueable;

    protected $schedule_date;
    protected $schedule_time;
    protected $position_applied;

    /**
     * Create a new notification instance.
     */
    public function __construct($schedule_date = null, $schedule_time = null, $position_applied = null)
    {
        $this->schedule_date = $schedule_date;
        $this->schedule_time = $schedule_time;
        $this->position_applied = $position_applied;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $date = $this->schedule_date ? date('d-m-Y', strtotime($this->schedule_date)) : '…';
        $time = $this->schedule_time ?: '…';
        return (new MailMessage)
            ->subject('Psychotest Invitation: Online Assessment')
            ->view('emails.user-invitation', [
                'name' => $notifiable->name,
                'position_applied' => $this->position_applied,
                'date' => $date,
                'time' => $time,
                'loginUrl' => url('/login'),
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
