import { MAIN_STORY } from '../data/mainStory.js';

export class StoryEngine {
  constructor(gameState) {
    this.gs = gameState;
    if (!this.gs.story) {
      this.gs.story = {
        act: 1,
        missionId: 'prologue_debt',
        completedMissions: [],
        npcRelations: {},
        journal: [],
        sideCompleted: [],
      };
    }
  }

  get currentMission() {
    return MAIN_STORY.missions[this.gs.story.missionId] || null;
  }

  get currentAct() {
    return MAIN_STORY.acts[this.gs.story.act] || null;
  }

  getObjectives() {
    const mission = this.currentMission;
    if (!mission) return [];
    return mission.objectives.map(obj => ({
      ...obj,
      done: this._checkObjective(obj),
    }));
  }

  getCompletedObjectivesCount() {
    return this.getObjectives().filter(o => o.done).length;
  }

  isMissionComplete() {
    const objs = this.getObjectives();
    return objs.length > 0 && objs.every(o => o.done);
  }

  checkProgress() {
    const mission = this.currentMission;
    if (!mission) return null;

    if (this.isMissionComplete()) {
      return this._completeMission();
    }
    return null;
  }

  _completeMission() {
    const mission = this.currentMission;
    const missionId = this.gs.story.missionId;

    this.gs.story.completedMissions.push(missionId);

    this._addJournal(mission.title, mission.completionText || 'Миссия завершена.');

    if (mission.reward) {
      if (mission.reward.credits) this.gs.credits += mission.reward.credits;
      if (mission.reward.reputation) {
        for (const [fac, val] of Object.entries(mission.reward.reputation)) {
          if (!this.gs.factionRep[fac]) this.gs.factionRep[fac] = 0;
          this.gs.factionRep[fac] += val;
        }
      }
      if (mission.reward.flags) {
        for (const [k, v] of Object.entries(mission.reward.flags)) {
          this.gs.setQuestFlag(k, v);
        }
      }
    }

    const next = this._getNextMission(mission);
    if (next) {
      this.gs.story.missionId = next;
      const nextMission = MAIN_STORY.missions[next];
      if (nextMission && nextMission.act && nextMission.act !== this.gs.story.act) {
        this.gs.story.act = nextMission.act;
      }
      this._addJournal(MAIN_STORY.missions[next]?.title || '', 'Новая миссия доступна.');
    } else {
      this.gs.story.missionId = null;
    }

    this.gs.save();
    return { completed: missionId, next };
  }

  _getNextMission(mission) {
    if (mission.nextMission) {
      if (typeof mission.nextMission === 'string') return mission.nextMission;
      for (const branch of mission.nextMission) {
        if (!branch.condition || this._checkCondition(branch.condition)) {
          return branch.id;
        }
      }
    }
    return null;
  }

  _checkObjective(obj) {
    const gs = this.gs;
    switch (obj.type) {
      case 'credits':
        return gs.credits >= obj.amount;
      case 'visit':
        return gs.visited.includes(obj.system);
      case 'flag':
        return gs.getQuestFlag(obj.key) === (obj.value !== undefined ? obj.value : true);
      case 'day':
        return gs.day >= obj.min;
      case 'reputation':
        return (gs.factionRep[obj.faction] || 0) >= obj.min;
      case 'kill':
        return (gs.kills || 0) >= obj.count;
      case 'ship':
        return gs.shipType === obj.shipType;
      case 'cargo':
        return gs.cargo.some(c => c.goodId === obj.goodId && c.qty >= (obj.qty || 1));
      case 'quest_complete':
        return (gs.textQuestsCompleted || []).includes(obj.questId);
      case 'npc_met':
        return !!gs.getQuestFlag('npc_met_' + obj.npcId);
      case 'timer_active':
        return gs.activeTimers && gs.activeTimers.some(t => t.id === obj.timerId);
      case 'loan':
        return gs.loan >= obj.min;
      case 'loan_paid':
        return gs.loan === 0 && gs.getQuestFlag('had_loan');
      default:
        return false;
    }
  }

  _checkCondition(cond) {
    if (cond.flag) return this.gs.getQuestFlag(cond.flag) === (cond.value !== undefined ? cond.value : true);
    if (cond.reputation) return (this.gs.factionRep[cond.reputation] || 0) >= (cond.min || 0);
    if (cond.credits) return this.gs.credits >= cond.credits;
    return true;
  }

  _addJournal(title, text) {
    this.gs.story.journal.unshift({
      day: this.gs.day,
      title,
      text,
      time: Date.now(),
    });
    if (this.gs.story.journal.length > 50) this.gs.story.journal.length = 50;
  }

  getMissionBrief(missionId) {
    const m = MAIN_STORY.missions[missionId || this.gs.story.missionId];
    if (!m) return null;
    return {
      title: m.title,
      desc: m.description,
      objectives: this.getObjectives(),
      npc: m.npc || null,
      act: m.act || this.gs.story.act,
      hint: m.hint || null,
    };
  }

  getJournal() {
    return this.gs.story.journal || [];
  }

  getNpcInfo(npcId) {
    return MAIN_STORY.npcs[npcId] || null;
  }

  getAllMissions() {
    const completed = this.gs.story.completedMissions || [];
    const current = this.gs.story.missionId;
    const result = [];

    for (const [id, m] of Object.entries(MAIN_STORY.missions)) {
      const status = completed.includes(id) ? 'done' : id === current ? 'active' : 'locked';
      result.push({ id, title: m.title, act: m.act, status, category: m.category || 'main' });
    }
    return result;
  }

  getSideMissions() {
    return (MAIN_STORY.sideMissions || []).map(m => ({
      ...m,
      status: (this.gs.story.sideCompleted || []).includes(m.id) ? 'done' :
        this._checkSideAvailable(m) ? 'available' : 'locked',
    }));
  }

  _checkSideAvailable(m) {
    if (m.minDay && this.gs.day < m.minDay) return false;
    if (m.requires) {
      for (const [k, v] of Object.entries(m.requires)) {
        if (this.gs.getQuestFlag(k) !== v) return false;
      }
    }
    if (m.minAct && this.gs.story.act < m.minAct) return false;
    return true;
  }

  completeSideMission(missionId) {
    if (!this.gs.story.sideCompleted) this.gs.story.sideCompleted = [];
    if (!this.gs.story.sideCompleted.includes(missionId)) {
      this.gs.story.sideCompleted.push(missionId);
      const side = (MAIN_STORY.sideMissions || []).find(m => m.id === missionId);
      if (side) this._addJournal(side.title, 'Побочная миссия завершена.');
      this.gs.save();
    }
  }
}
