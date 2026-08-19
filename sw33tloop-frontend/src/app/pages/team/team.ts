import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { StrapiService, TeamMember } from '../../core/strapi';

@Component({
  selector: 'app-team',
  imports: [],
  templateUrl: './team.html',
  styleUrl: './team.css'
})
export class Team implements OnInit {
  members: TeamMember[] = [];

  constructor(private strapi: StrapiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.strapi.getTeamMembers().subscribe({
      next: (res) => {
        this.members = res.data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load team members', err)
    });
  }

  getImageUrl(member: TeamMember): string {
    return this.strapi.getImageUrl(member.photo);
  }
}