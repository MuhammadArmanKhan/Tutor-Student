import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Parent',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      content: 'EduSync has transformed how I track my daughter\'s progress. The detailed reports and insights help me understand exactly how she\'s learning.',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Math Tutor',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
      content: 'The AI analytics are incredible. I can see exactly when my students are engaged and adjust my teaching style accordingly. My student retention has increased by 40%.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Student, Age 16',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
      content: 'Being able to review session recordings has been a game-changer for my studies. I can revisit complex topics anytime and my grades have improved significantly.',
      rating: 5,
    },
    {
      name: 'David Thompson',
      role: 'Language Tutor',
      avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
      content: 'The transcription feature is amazing for language learning. Students can see exactly how they\'re pronouncing words and track their improvement over time.',
      rating: 5,
    },
    {
      name: 'Lisa Park',
      role: 'Parent & Educator',
      avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400',
      content: 'As both a parent and teacher, EduSync gives me the comprehensive view I need. The platform bridges the gap between home and professional tutoring.',
      rating: 5,
    },
    {
      name: 'James Wilson',
      role: 'Science Tutor',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
      content: 'The engagement metrics help me identify when students are struggling before they even realize it. This proactive approach has revolutionized my teaching.',
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-24 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary-500 to-accent-emerald bg-clip-text text-transparent">
              Loved by Thousands
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            See what our community of tutors, students, and parents have to say about 
            their experience with EduSync.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              {/* Quote Icon */}
              <Quote className="h-8 w-8 text-primary-500/50 mb-4" />

              {/* Content */}
              <p className="text-gray-300 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Rating */}
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-accent-amber fill-current" />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center space-x-3">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-accent-emerald/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: '4.9/5', label: 'Average Rating' },
              { value: '10,000+', label: 'Happy Users' },
              { value: '98%', label: 'Satisfaction Rate' },
              { value: '24/7', label: 'Support Available' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl font-bold text-primary-500 mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;