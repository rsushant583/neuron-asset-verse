
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Vote, Clock, CheckCircle, XCircle } from 'lucide-react';

const DAOVoting = () => {
  const proposals = [
    {
      id: 1,
      title: "Implement Creator Verification System",
      description: "Add a verification badge system for established creators with proven track records.",
      status: "active",
      votes: { for: 847, against: 203 },
      timeLeft: "2 days",
      userVoted: false
    },
    {
      id: 2,
      title: "Reduce Platform Fees for New Creators",
      description: "Lower platform fees from 5% to 3% for creators in their first 6 months.",
      status: "active", 
      votes: { for: 623, against: 156 },
      timeLeft: "5 days",
      userVoted: true,
      userVote: "for"
    },
    {
      id: 3,
      title: "Monthly Creator Spotlight Program",
      description: "Feature top creators on the platform homepage with additional promotion.",
      status: "passed",
      votes: { for: 1205, against: 89 },
      timeLeft: "Ended",
      userVoted: true,
      userVote: "for"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">DAO Governance</h2>
        <div className="text-sm text-gray-400">
          Your voting power: 1,247 $MM
        </div>
      </div>

      <div className="grid gap-6">
        {proposals.map((proposal, index) => (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="glass-morphism border-cyber-blue/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Vote className="text-cyber-blue" size={20} />
                      <span>{proposal.title}</span>
                    </CardTitle>
                    <p className="text-gray-400 mt-2">{proposal.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {proposal.status === 'active' && (
                      <div className="flex items-center space-x-1 text-yellow-400">
                        <Clock size={16} />
                        <span className="text-sm">{proposal.timeLeft}</span>
                      </div>
                    )}
                    {proposal.status === 'passed' && (
                      <div className="flex items-center space-x-1 text-green-400">
                        <CheckCircle size={16} />
                        <span className="text-sm">Passed</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Vote Results */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">For: {proposal.votes.for} votes</span>
                    <span className="text-gray-400">Against: {proposal.votes.against} votes</span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyber-blue to-cyber-purple h-2 rounded-full"
                      style={{ 
                        width: `${(proposal.votes.for / (proposal.votes.for + proposal.votes.against)) * 100}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Voting Buttons */}
                {proposal.status === 'active' && (
                  <div className="flex space-x-3">
                    {!proposal.userVoted ? (
                      <>
                        <Button 
                          className="flex-1 bg-cyber-blue hover:bg-cyber-blue/80"
                          size="sm"
                        >
                          Vote For
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/20"
                          size="sm"
                        >
                          Vote Against
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center space-x-2 text-cyber-blue">
                        <CheckCircle size={16} />
                        <span className="text-sm">
                          You voted {proposal.userVote === 'for' ? 'For' : 'Against'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DAOVoting;
