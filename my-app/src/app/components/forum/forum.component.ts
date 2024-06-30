import { Component, OnInit } from '@angular/core';
import { ForumService } from 'app/services/forum.service';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { CreateForumDto } from 'app/models/create-forum.dto';


@Component({
  selector: 'app-forum',
  templateUrl: './forum.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ],
  styleUrls: ['./forum.component.scss']
})
export class ForumComponent implements OnInit {
  successMessage: string = '';
  successDeleteMessage: string = '';
  forums: any[] = [];

  constructor(private forumService: ForumService) {}

  ngOnInit() {
    this.getForums();
  }

  getForums() {
    this.forumService.getForums().subscribe({
      next: (response) => {
        console.log('Response:', response);
        if (response.data && Array.isArray(response.data)) {
          this.forums = response.data;
          console.log('Forums retrieved:', this.forums);
        } else {
          console.error('Response does not contain a valid data array:', response);
        }
      },
      error: (error) => {
        console.error('Error fetching forums:', error);
      }
    });
  }

  submitForum(forumData: CreateForumDto) {
    this.forumService.createForum(forumData).subscribe({
      next: (response) => {
        this.successMessage = 'Forum post created successfully!';
        console.log('Forum creation success:', response);
        this.getForums();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Forum creation failed:', error);
      }
    });
  }

  deleteForum(id: number) {
    this.forumService.deleteForum(id).subscribe({
      next: () => {
        this.forums = this.forums.filter(forum => forum.id_forum !== id);
        this.successDeleteMessage = `Forum post with ID ${id} deleted successfully.`;
        console.log('Forum deleted:', id);
        setTimeout(() => {
          this.successDeleteMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error deleting forum:', error);
      }
    });
  }
}
