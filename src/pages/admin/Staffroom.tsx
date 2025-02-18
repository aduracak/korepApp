'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, School, GraduationCap, BookOpen, CalendarDays } from 'lucide-react';
import { SchoolsTab } from '../../components/staffroom/SchoolsTab';
import { SubjectsTab } from '../../components/staffroom/SubjectsTab';
import { TeachingTab } from '../../components/staffroom/TeachingTab';
import { ClassesTab } from '../../components/staffroom/ClassesTab';

type TabType = 'schools' | 'classes' | 'subjects' | 'teaching';

const tabs = [
  {
    id: 'schools' as const,
    name: 'Škole',
    icon: School,
    count: 0,
  },
  {
    id: 'classes' as const,
    name: 'Razredi',
    icon: GraduationCap,
    count: 0,
  },
  {
    id: 'subjects' as const,
    name: 'Predmeti',
    icon: BookOpen,
    count: 0,
  },
  {
    id: 'teaching' as const,
    name: 'Nastava',
    icon: CalendarDays,
    count: 0,
  },
];

export const Staffroom = () => {
  const [activeTab, setActiveTab] = useState<TabType>('schools');

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white">Zbornica</h1>
            <p className="text-gray-400">Upravljajte školama, razredima, predmetima i nastavom</p>
          </div>
        </div>
      </div>

      <div className="border-b border-white/10">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 border-b-2 px-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-violet-500 text-white'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.name}</span>
                {tab.count > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-violet-500/10 text-violet-400 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-[60vh]">
        {activeTab === 'schools' && <SchoolsTab />}
        {activeTab === 'classes' && <ClassesTab />}
        {activeTab === 'subjects' && <SubjectsTab />}
        {activeTab === 'teaching' && <TeachingTab />}
      </div>
    </div>
  );
}; 