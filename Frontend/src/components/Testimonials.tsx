import React from 'react';
import { Star } from 'lucide-react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Electronic Music Producer',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300',
      rating: 5,
      content: 'Winning the Summer Beat Battle tournament was a game-changer for my career. The exposure and feedback I received were invaluable.'
    },
    {
      name: 'Michael Chen',
      role: 'Hip Hop Artist',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
      rating: 5,
      content: 'The community here is amazing. I\'ve connected with other artists and even landed some collaboration opportunities through tournaments.'
    },
    {
      name: 'Emma Rodriguez',
      role: 'Classical Pianist',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300',
      rating: 5,
      content: 'As a classical musician, I was skeptical about online competitions, but MusikMadness has proven to be a fantastic platform for showcasing my work.'
    }
  ];

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 backdrop-blur-sm bg-black/20 p-6 rounded-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">What Musicians Say</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Hear from artists who have participated in our tournaments and grown their careers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="backdrop-blur-sm bg-black/40 rounded-xl shadow-lg border border-gray-800/60 p-6 transition-all duration-300 hover:shadow-xl hover:bg-black/60 h-full flex flex-col"
            >
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-pink-500/70"
                />
                <div>
                  <h4 className="font-bold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`}
                  />
                ))}
              </div>
              
              <p className="text-gray-300 italic flex-grow">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;