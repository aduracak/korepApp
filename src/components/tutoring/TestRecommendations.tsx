import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Calendar, Clock, BookOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format, differenceInDays } from 'date-fns';

interface Test {
  id: string;
  title: string;
  date: string;
  subject: {
    name: string;
  };
  topics: string[];
  recommended_prep_time: number;
}

interface Topic {
  id: string;
  name: string;
  is_current_in_school: boolean;
}

export const TestRecommendations: React.FC = () => {
  const [upcomingTests, setUpcomingTests] = useState<Test[]>([]);
  const [topics, setTopics] = useState<Record<string, Topic[]>>({});

  useEffect(() => {
    fetchUpcomingTests();
  }, []);

  useEffect(() => {
    if (upcomingTests.length > 0) {
      fetchTopics();
    }
  }, [upcomingTests]);

  const fetchUpcomingTests = async () => {
    const { data: tests } = await supabase
      .from('tests')
      .select(`
        id,
        title,
        date,
        subject:subject_id(name),
        topics,
        recommended_prep_time
      `)
      .gte('date', new Date().toISOString())
      .order('date');

    if (tests) {
      setUpcomingTests(tests);
    }
  };

  const fetchTopics = async () => {
    const allTopicIds = upcomingTests.flatMap(test => test.topics);
    
    const { data: topicsData } = await supabase
      .from('topics')
      .select('*')
      .in('id', allTopicIds);

    if (topicsData) {
      const topicsMap: Record<string, Topic[]> = {};
      upcomingTests.forEach(test => {
        topicsMap[test.id] = test.topics
          .map(topicId => topicsData.find(t => t.id === topicId))
          .filter((topic): topic is Topic => topic !== undefined);
      });
      setTopics(topicsMap);
    }
  };

  if (upcomingTests.length === 0) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg border border-white/10 p-6">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-20">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white">Nema nadolazećih testova</h3>
            <p className="text-gray-400">Trenutno nemate zakazanih testova</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {upcomingTests.map(test => {
        const daysUntilTest = differenceInDays(new Date(test.date), new Date());
        const testTopics = topics[test.id] || [];
        const urgencyLevel = 
          daysUntilTest <= 3 ? 'high' :
          daysUntilTest <= 7 ? 'medium' : 'low';

        return (
          <motion.div
            key={test.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`bg-slate-800/50 backdrop-blur-xl rounded-lg border ${
              urgencyLevel === 'high'
                ? 'border-red-500/20 bg-red-500/5'
                : urgencyLevel === 'medium'
                ? 'border-yellow-500/20 bg-yellow-500/5'
                : 'border-white/10'
            } p-6 space-y-4`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${
                  urgencyLevel === 'high'
                    ? 'bg-gradient-to-r from-red-500 to-pink-500'
                    : urgencyLevel === 'medium'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                }`}>
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {test.title}
                  </h3>
                  <p className="text-gray-400">
                    {test.subject.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">
                  {format(new Date(test.date), 'dd.MM.yyyy.')}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Preporučeno vrijeme za pripremu: {test.recommended_prep_time}min</span>
                </div>
                <div className="text-gray-400">
                  Za {daysUntilTest} {daysUntilTest === 1 ? 'dan' : 'dana'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-400">
                  Teme za pripremu:
                </div>
                <div className="flex flex-wrap gap-2">
                  {testTopics.map(topic => (
                    <div
                      key={topic.id}
                      className={`px-3 py-1 rounded-full text-sm ${
                        topic.is_current_in_school
                          ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                          : 'bg-white/5 text-gray-400 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        {topic.is_current_in_school && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                        <span>{topic.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors">
                Zakaži korepeticiju
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}; 