export enum Role {
  MEMBER = 'member',
  OFFICER = 'officer',
  CO_LEADER = 'co_leader',
  LEADER = 'leader',
}

export interface RolePermissions {
  canManageMatches: boolean;
  canManageMembers: boolean;
  canManageOfficers: boolean;
  canManageCoLeaders: boolean;
  canManageSettings: boolean;
  canDeleteClub: boolean;
}

export class AdminSystem {
  private static readonly ROLE_HIERARCHY = {
    [Role.MEMBER]: 0,
    [Role.OFFICER]: 1,
    [Role.CO_LEADER]: 2,
    [Role.LEADER]: 3,
  };

  private static readonly ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
    [Role.MEMBER]: {
      canManageMatches: false,
      canManageMembers: false,
      canManageOfficers: false,
      canManageCoLeaders: false,
      canManageSettings: false,
      canDeleteClub: false,
    },
    [Role.OFFICER]: {
      canManageMatches: true,
      canManageMembers: true,
      canManageOfficers: false,
      canManageCoLeaders: false,
      canManageSettings: false,
      canDeleteClub: false,
    },
    [Role.CO_LEADER]: {
      canManageMatches: true,
      canManageMembers: true,
      canManageOfficers: true,
      canManageCoLeaders: false,
      canManageSettings: true,
      canDeleteClub: false,
    },
    [Role.LEADER]: {
      canManageMatches: true,
      canManageMembers: true,
      canManageOfficers: true,
      canManageCoLeaders: true,
      canManageSettings: true,
      canDeleteClub: true,
    },
  };

  /**
   * Check if a user has permission to manage another user
   */
  static canManageUser(managerRole: Role, targetRole: Role): boolean {
    return this.ROLE_HIERARCHY[managerRole] > this.ROLE_HIERARCHY[targetRole];
  }

  /**
   * Get permissions for a role
   */
  static getPermissions(role: Role): RolePermissions {
    return this.ROLE_PERMISSIONS[role];
  }

  /**
   * Validate role change
   */
  static validateRoleChange(
    currentLeaderCount: number,
    currentCoLeaderCount: number,
    oldRole: Role,
    newRole: Role,
    managerRole: Role
  ): { 
    isValid: boolean; 
    error?: string;
  } {
    // Check if manager has permission to make this change
    if (!this.canManageUser(managerRole, oldRole) || !this.canManageUser(managerRole, newRole)) {
      return { 
        isValid: false, 
        error: 'You do not have permission to make this role change' 
      };
    }

    // Prevent removal of last leader
    if (oldRole === Role.LEADER && currentLeaderCount <= 1) {
      return { 
        isValid: false, 
        error: 'Cannot remove the last leader' 
      };
    }

    // Enforce co-leader limit (max 2)
    if (newRole === Role.CO_LEADER && currentCoLeaderCount >= 2 && oldRole !== Role.CO_LEADER) {
      return { 
        isValid: false, 
        error: 'Maximum number of co-leaders reached (2)' 
      };
    }

    return { isValid: true };
  }

  /**
   * Check if user can be removed
   */
  static canRemoveUser(
    targetRole: Role,
    managerRole: Role,
    currentLeaderCount: number,
    isLastAdmin: boolean
  ): {
    canRemove: boolean;
    error?: string;
  } {
    // Check if manager has permission
    if (!this.canManageUser(managerRole, targetRole)) {
      return {
        canRemove: false,
        error: 'You do not have permission to remove this user',
      };
    }

    // Prevent removal of last leader
    if (targetRole === Role.LEADER && currentLeaderCount <= 1) {
      return {
        canRemove: false,
        error: 'Cannot remove the last leader',
      };
    }

    // Prevent removal of last admin
    if (isLastAdmin && 
        (targetRole === Role.LEADER || 
         targetRole === Role.CO_LEADER || 
         targetRole === Role.OFFICER)) {
      return {
        canRemove: false,
        error: 'Cannot remove the last admin',
      };
    }

    return { canRemove: true };
  }
}
