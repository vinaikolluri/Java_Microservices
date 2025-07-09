package com.attendance_management.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

@Data
@Entity
@Table(name = "teams")
public class Team {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TeamDesignation designation;
    
    @Column(nullable = false)
    private String department;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_team_id")
    private Team parentTeam;
    
    @OneToMany(mappedBy = "parentTeam", cascade = CascadeType.ALL)
    private List<Team> subTeams;
    
    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL)
    private List<Employee> members;
    
    private String description;
    
    @ElementCollection
    @CollectionTable(name = "team_access_roles")
    @Column(name = "role")
    private Set<EmployeeRole> allowedRoles = new HashSet<>();
    
    @Column(nullable = false)
    private String projectCode;
    
    private boolean active = true;
}

