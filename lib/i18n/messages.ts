export const SUPPORTED_LOCALES = ["zh", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export type Messages = {
  layout: {
    brandKicker: string;
    brandTitle: string;
    brandDescription: string;
    language: {
      label: string;
      zh: string;
      en: string;
    };
    nav: {
      dashboard: string;
      projects: string;
      documents: string;
      approvals: string;
    };
  };
  dashboard: {
    eyebrow: string;
    title: string;
    description: string;
    metrics: {
      projects: { label: string; detail: string };
      pendingApprovals: { label: string; detail: string };
    };
    snapshot: {
      title: string;
      inProgressProjects: string;
      blockedProjects: string;
      recentChanges: string;
    };
  };
  common: {
    overview: string;
    labels: {
      project: string;
      prioritySuffix: string;
      awaitingDecision: string;
      generatedAt: string;
    };
    actions: {
      newProject: string;
      createProject: string;
      addRequirement: string;
      submitChangeRequest: string;
      generateRequirementDoc: string;
      startRun: string;
      approve: string;
      reject: string;
      openRun: string;
      open: string;
      backToProject: string;
    };
    empty: {
      noProjectsTitle: string;
      noProjectsDescription: string;
    };
    fields: {
      name: string;
      summary: string;
      goal: string;
      title: string;
      originalRequest: string;
      normalizedDescription: string;
      priority: string;
      runType: string;
      executionMode: string;
      targetStage: string;
      currentStage: string;
      taskPackage: string;
      worktree: string;
      repo: string;
      workspace: string;
      comment: string;
      changeType: string;
      targetRequirement: string;
      proposedTitle: string;
      proposedContent: string;
      reason: string;
      impactSummary: string;
      updated: string;
      requirements: string;
      status: string;
    };
    values: {
      noTarget: string;
      high: string;
      medium: string;
      low: string;
    };
  };
  pages: {
    projects: {
      eyebrow: string;
      title: string;
      description: string;
      sectionTitle: string;
    };
    newProject: {
      eyebrow: string;
      title: string;
      description: string;
    };
    projectDetail: {
      goal: string;
      quickFacts: string;
      pendingApprovals: string;
      recentRuns: string;
      recentRunsDescription: string;
      requirementBacklog: string;
      addRequirement: string;
      changeManagement: string;
      approvals: string;
      approvalsDescription: string;
      documents: string;
      documentsDescription: string;
    };
    requirementDetail: {
      lifecycle: string;
      engineeringStages: string;
      context: string;
      originalRequest: string;
      version: string;
      execution: string;
      executionDescription: string;
      runHistory: string;
    };
    runDetail: {
      eyebrow: string;
      title: string;
      description: string;
      summary: string;
      artifacts: string;
      decisions: string;
    };
    approvals: {
      eyebrow: string;
      title: string;
      description: string;
    };
    documents: {
      eyebrow: string;
      title: string;
      description: string;
    };
  };
  changeRequest: {
    modifyExisting: string;
    addNew: string;
    deleteExisting: string;
  };
    status: {
    project: Record<string, string>;
    requirement: Record<string, string>;
    stage: Record<string, string>;
    approval: Record<string, string>;
    changeRequest: Record<string, string>;
    execution: Record<string, string>;
  };
};

export const messages: Record<Locale, Messages> = {
  zh: {
    layout: {
      brandKicker: "Softfactory",
      brandTitle: "软件工厂",
      brandDescription: "面向需求驱动交付的本地控制台。",
      language: {
        label: "语言",
        zh: "中文",
        en: "English",
      },
      nav: {
        dashboard: "仪表盘",
        projects: "项目",
        documents: "文档",
        approvals: "审批",
      },
    },
    dashboard: {
      eyebrow: "第一阶段",
      title: "软件工厂",
      description: "在一个本地指挥台中统一管理项目、需求、审批和生成文档。",
      metrics: {
        projects: {
          label: "项目数",
          detail: "当前在本地工厂中跟踪的交付流。",
        },
        pendingApprovals: {
          label: "待审批",
          detail: "等待人工确认的关键节点。",
        },
      },
      snapshot: {
        title: "运行快照",
        inProgressProjects: "进行中的项目",
        blockedProjects: "阻塞项目",
        recentChanges: "最近变更",
      },
    },
    common: {
      overview: "概览",
      labels: {
        project: "项目",
        prioritySuffix: "优先级",
        awaitingDecision: "等待操作人决策。",
        generatedAt: "生成时间",
      },
      actions: {
        newProject: "新建项目",
        createProject: "创建项目",
        addRequirement: "新增需求",
        submitChangeRequest: "提交变更单",
        generateRequirementDoc: "生成需求文档",
        startRun: "发起运行",
        approve: "批准",
        reject: "驳回",
        openRun: "打开运行",
        open: "打开",
        backToProject: "返回项目",
      },
      empty: {
        noProjectsTitle: "还没有项目",
        noProjectsDescription: "创建第一个项目，开始跟踪需求、文档和审批。",
      },
      fields: {
        name: "名称",
        summary: "摘要",
        goal: "目标",
        title: "标题",
        originalRequest: "原始需求",
        normalizedDescription: "结构化描述",
        priority: "优先级",
        runType: "运行类型",
        executionMode: "执行模式",
        targetStage: "目标阶段",
        currentStage: "当前阶段",
        taskPackage: "任务包",
        worktree: "工作树",
        repo: "代码库",
        workspace: "工作区",
        comment: "备注",
        changeType: "变更类型",
        targetRequirement: "目标需求",
        proposedTitle: "建议标题",
        proposedContent: "建议内容",
        reason: "变更原因",
        impactSummary: "影响说明",
        updated: "更新时间",
        requirements: "需求数",
        status: "状态",
      },
      values: {
        noTarget: "无目标",
        high: "高",
        medium: "中",
        low: "低",
      },
    },
    pages: {
      projects: {
        eyebrow: "项目",
        title: "项目组合",
        description: "浏览所有软件项目，跟踪状态，并进入需求工作台。",
        sectionTitle: "全部项目",
      },
      newProject: {
        eyebrow: "创建",
        title: "新建项目",
        description: "启动一个新的本地软件项目，并为结构化需求管理做好准备。",
      },
      projectDetail: {
        goal: "目标",
        quickFacts: "关键指标",
        pendingApprovals: "待审批",
        recentRuns: "最近运行",
        recentRunsDescription: "查看最近的执行任务与状态。",
        requirementBacklog: "需求列表",
        addRequirement: "新增需求",
        changeManagement: "变更管理",
        approvals: "审批",
        approvalsDescription: "待处理与历史决策",
        documents: "文档",
        documentsDescription: "已生成的交付产物",
      },
      requirementDetail: {
        lifecycle: "生命周期",
        engineeringStages: "工程阶段",
        context: "上下文",
        originalRequest: "原始需求",
        version: "版本",
        execution: "执行",
        executionDescription: "从当前需求发起完整运行或单阶段运行。",
        runHistory: "运行历史",
      },
      runDetail: {
        eyebrow: "执行",
        title: "运行详情",
        description: "查看单次执行的任务包、日志、产物和决策记录。",
        summary: "摘要",
        artifacts: "产物",
        decisions: "决策",
      },
      approvals: {
        eyebrow: "控制",
        title: "审批",
        description: "跟踪需求、设计、测试和变更的确认节点。",
      },
      documents: {
        eyebrow: "产物",
        title: "文档",
        description: "查看保存在本地工作区中的需求、设计和测试文档。",
      },
    },
    changeRequest: {
      modifyExisting: "修改已有需求",
      addNew: "新增需求",
      deleteExisting: "删除已有需求",
    },
    status: {
      project: {
        draft: "草稿",
        in_progress: "进行中",
        blocked: "阻塞",
        completed: "已完成",
        archived: "已归档",
      },
      requirement: {
        pending_triage: "待整理",
        in_progress: "进行中",
        pending_approval: "待审批",
        completed: "已完成",
        changed: "已变更",
        active: "有效",
        removed: "已移除",
      },
      stage: {
        requirement: "需求",
        design: "设计",
        development: "开发",
        test: "测试",
        approval: "审批",
        not_started: "未开始",
        in_progress: "进行中",
        pending_confirmation: "待确认",
        completed: "已完成",
        rejected: "已驳回",
        pending: "待审批",
        approved: "已批准",
      },
      approval: {
        pending: "待审批",
        approved: "已批准",
        rejected: "已驳回",
        requirement_confirmation: "需求确认",
        design_confirmation: "设计确认",
        test_confirmation: "测试确认",
        change_request_confirmation: "变更确认",
      },
      changeRequest: {
        draft: "草稿",
        pending_approval: "待审批",
        approved: "已批准",
        rejected: "已驳回",
        applied: "已应用",
        modify: "修改",
        add: "新增",
        delete: "删除",
      },
      execution: {
        queued: "排队中",
        preparing: "准备中",
        running: "运行中",
        waiting_for_decision: "待确认",
        succeeded: "已成功",
        failed: "已失败",
        cancelled: "已取消",
        manual_gate: "手动门控",
        auto_flow: "自动流转",
        full_run: "完整运行",
        stage_run: "单阶段运行",
        design_review: "设计评审",
        implementation_review: "实现评审",
        test_review: "测试评审",
      },
    },
  },
  en: {
    layout: {
      brandKicker: "Softfactory",
      brandTitle: "Software Factory",
      brandDescription: "Local console for requirement-led delivery.",
      language: {
        label: "Language",
        zh: "中文",
        en: "English",
      },
      nav: {
        dashboard: "Dashboard",
        projects: "Projects",
        documents: "Documents",
        approvals: "Approvals",
      },
    },
    dashboard: {
      eyebrow: "Phase One",
      title: "Software Factory",
      description: "Operate projects, requirements, approvals, and generated documents from one local command center.",
      metrics: {
        projects: {
          label: "Projects",
          detail: "Active delivery streams tracked in the local factory.",
        },
        pendingApprovals: {
          label: "Pending approvals",
          detail: "Human confirmation gates waiting for a decision.",
        },
      },
      snapshot: {
        title: "Operational snapshot",
        inProgressProjects: "In-progress projects",
        blockedProjects: "Blocked projects",
        recentChanges: "Recent changes",
      },
    },
    common: {
      overview: "Overview",
      labels: {
        project: "Project",
        prioritySuffix: "priority",
        awaitingDecision: "Awaiting operator decision.",
        generatedAt: "Generated",
      },
      actions: {
        newProject: "New project",
        createProject: "Create project",
        addRequirement: "Add requirement",
        submitChangeRequest: "Submit change request",
        generateRequirementDoc: "Generate requirement doc",
        startRun: "Start run",
        approve: "Approve",
        reject: "Reject",
        openRun: "Open run",
        open: "Open",
        backToProject: "Back to project",
      },
      empty: {
        noProjectsTitle: "No projects yet",
        noProjectsDescription: "Create the first project to start tracking requirements and approvals.",
      },
      fields: {
        name: "Name",
        summary: "Summary",
        goal: "Goal",
        title: "Title",
        originalRequest: "Original request",
        normalizedDescription: "Normalized description",
        priority: "Priority",
        runType: "Run type",
        executionMode: "Execution mode",
        targetStage: "Target stage",
        currentStage: "Current stage",
        taskPackage: "Task package",
        worktree: "Worktree",
        repo: "Repository",
        workspace: "Workspace",
        comment: "Comment",
        changeType: "Change type",
        targetRequirement: "Target requirement",
        proposedTitle: "Proposed title",
        proposedContent: "Proposed content",
        reason: "Reason",
        impactSummary: "Impact summary",
        updated: "Updated",
        requirements: "Requirements",
        status: "Status",
      },
      values: {
        noTarget: "No target",
        high: "High",
        medium: "Medium",
        low: "Low",
      },
    },
    pages: {
      projects: {
        eyebrow: "Projects",
        title: "Project Portfolio",
        description: "Browse every software initiative, track status, and jump into detailed requirement workspaces.",
        sectionTitle: "All active projects",
      },
      newProject: {
        eyebrow: "Create",
        title: "New Project",
        description: "Start a local software initiative with a clear summary, goal, and room for structured requirements.",
      },
      projectDetail: {
        goal: "Goal",
        quickFacts: "Quick facts",
        pendingApprovals: "Pending approvals",
        recentRuns: "Recent runs",
        recentRunsDescription: "Review the latest execution tasks and statuses.",
        requirementBacklog: "Requirement backlog",
        addRequirement: "Add requirement",
        changeManagement: "Change management",
        approvals: "Approvals",
        approvalsDescription: "Pending and recent decisions",
        documents: "Documents",
        documentsDescription: "Generated artifacts",
      },
      requirementDetail: {
        lifecycle: "Lifecycle",
        engineeringStages: "Engineering stages",
        context: "Context",
        originalRequest: "Original request",
        version: "Version",
        execution: "Execution",
        executionDescription: "Launch a full run or a single-stage run from this requirement.",
        runHistory: "Run history",
      },
      runDetail: {
        eyebrow: "Execution",
        title: "Run Detail",
        description: "Inspect one execution run, including its package, logs, artifacts, and decisions.",
        summary: "Summary",
        artifacts: "Artifacts",
        decisions: "Decisions",
      },
      approvals: {
        eyebrow: "Control",
        title: "Approvals",
        description: "Track confirmation gates for requirements, design, tests, and change requests.",
      },
      documents: {
        eyebrow: "Artifacts",
        title: "Documents",
        description: "Review generated requirement, design, and test artifacts stored in the local workspace.",
      },
    },
    changeRequest: {
      modifyExisting: "Modify existing requirement",
      addNew: "Add new requirement",
      deleteExisting: "Delete existing requirement",
    },
    status: {
      project: {
        draft: "Draft",
        in_progress: "In progress",
        blocked: "Blocked",
        completed: "Completed",
        archived: "Archived",
      },
      requirement: {
        pending_triage: "Pending triage",
        in_progress: "In progress",
        pending_approval: "Pending approval",
        completed: "Completed",
        changed: "Changed",
        active: "Active",
        removed: "Removed",
      },
      stage: {
        requirement: "Requirement",
        design: "Design",
        development: "Development",
        test: "Test",
        approval: "Approval",
        not_started: "Not started",
        in_progress: "In progress",
        pending_confirmation: "Pending confirmation",
        completed: "Completed",
        rejected: "Rejected",
        pending: "Pending",
        approved: "Approved",
      },
      approval: {
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
        requirement_confirmation: "Requirement confirmation",
        design_confirmation: "Design confirmation",
        test_confirmation: "Test confirmation",
        change_request_confirmation: "Change request confirmation",
      },
      changeRequest: {
        draft: "Draft",
        pending_approval: "Pending approval",
        approved: "Approved",
        rejected: "Rejected",
        applied: "Applied",
        modify: "Modify",
        add: "Add",
        delete: "Delete",
      },
      execution: {
        queued: "Queued",
        preparing: "Preparing",
        running: "Running",
        waiting_for_decision: "Waiting for decision",
        succeeded: "Succeeded",
        failed: "Failed",
        cancelled: "Cancelled",
        manual_gate: "Manual Gate",
        auto_flow: "Auto Flow",
        full_run: "Full Run",
        stage_run: "Stage Run",
        design_review: "Design review",
        implementation_review: "Implementation review",
        test_review: "Test review",
      },
    },
  },
};
