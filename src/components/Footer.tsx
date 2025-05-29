
import { motion } from 'framer-motion';

const Footer = () => {
  const footerSections = [
    {
      title: 'Platform',
      links: ['Create', 'Explore', 'Analytics', 'Documentation']
    },
    {
      title: 'Community',
      links: ['Discord', 'Twitter', 'GitHub', 'Blog']
    },
    {
      title: 'Resources',
      links: ['Whitepaper', 'Tokenomics', 'API', 'Help Center']
    },
    {
      title: 'Company',
      links: ['About', 'Careers', 'Press', 'Contact']
    }
  ];

  return (
    <footer className="bg-black border-t border-cyber-blue/20 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Brand Section */}
          <motion.div
            className="md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-purple neural-glow" />
              <span className="text-xl font-bold text-white">MetaMind</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              The decentralized platform where thoughts become digital assets.
            </p>
            <div className="flex space-x-4">
              {['🐦', '💬', '📱', '🔗'].map((emoji, index) => (
                <motion.div
                  key={index}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-cyber-blue/20 transition-colors"
                  whileHover={{ scale: 1.1, y: -2 }}
                >
                  {emoji}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <motion.li
                    key={link}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href="#"
                      className="text-gray-400 hover:text-cyber-blue transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-400 text-sm">
            © 2024 MetaMind Markets. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-cyber-blue text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-cyber-blue text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-cyber-blue text-sm transition-colors">
              Cookie Policy
            </a>
          </div>
        </motion.div>

        {/* Scroll to Top */}
        <motion.button
          className="mt-8 mx-auto block w-12 h-12 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform neural-glow"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          ↑
        </motion.button>
      </div>
    </footer>
  );
};

export default Footer;
