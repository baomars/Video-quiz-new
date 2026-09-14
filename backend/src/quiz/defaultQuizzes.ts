import { Quiz } from '../../../remotion/types/index.js';

export const defaultQuizzes: Record<string, Quiz> = {
  'quiz_vi_sample': {
    id: 'quiz_vi_sample',
    title: 'Thử Thách Kiến Thức Mỗi Ngày',
    language: 'vi',
    channelId: 'channel_trivia_master',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions: [
      {
        id: 'q_vi_1',
        question: 'Tháp Eiffel nổi tiếng nằm ở thủ đô nào của nước Pháp?',
        options: {
          A: 'Paris',
          B: 'Lyon',
          C: 'Marseille'
        },
        correctAnswer: 'A',
        explanation: 'Tháp Eiffel tọa lạc tại thủ đô Paris, được khánh thành vào năm 1889.',
        illustrations: ['/assets/sample_images/eiffel_tower.svg']
      },
      {
        id: 'q_vi_2',
        question: 'Kim tự tháp Giza vĩ đại thuộc quốc gia nào ngày nay?',
        options: {
          A: 'Hy Lạp',
          B: 'Ai Cập',
          C: 'Thổ Nhĩ Kỳ'
        },
        correctAnswer: 'B',
        explanation: 'Kim tự tháp Giza là kỳ quan cổ đại tráng lệ tại Ai Cập.',
        illustrations: ['/assets/sample_images/pyramids.svg']
      },
      {
        id: 'q_vi_3',
        question: 'Trí tuệ nhân tạo và Tự động hóa thuộc lĩnh vực nào?',
        options: {
          A: 'Nông nghiệp thủ công',
          B: 'Công nghệ cao 4.0',
          C: 'Khai khoáng thô'
        },
        correctAnswer: 'B',
        explanation: 'AI và Robot là hạt nhân phát triển của kỷ nguyên công nghệ cao 4.0.',
        illustrations: [
          '/assets/sample_images/robot_ai.svg'
        ]
      }
    ]
  },

  'quiz_en_sample': {
    id: 'quiz_en_sample',
    title: 'World Wonders & Tech Quiz',
    language: 'en',
    channelId: 'channel_trivia_master',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions: [
      {
        id: 'q_en_1',
        question: 'In which capital city is the iconic Eiffel Tower located?',
        options: {
          A: 'Paris',
          B: 'Rome',
          C: 'Berlin'
        },
        correctAnswer: 'A',
        explanation: 'The Eiffel Tower is situated on the Champ de Mars in Paris, France.',
        illustrations: ['/assets/sample_images/eiffel_tower.svg']
      },
      {
        id: 'q_en_2',
        question: 'Which ancient land is home to the Great Pyramids of Giza?',
        options: {
          A: 'Greece',
          B: 'Egypt',
          C: 'Italy'
        },
        correctAnswer: 'B',
        explanation: 'The Great Pyramids are ancient architectural wonders situated in Egypt.',
        illustrations: ['/assets/sample_images/pyramids.svg']
      },
      {
        id: 'q_en_3',
        question: 'Modern AI algorithms and robotics belong to which field?',
        options: {
          A: 'Handicraft',
          B: 'High Technology',
          C: 'Ancient Pottery'
        },
        correctAnswer: 'B',
        explanation: 'AI and robotics are driving forces in modern high technology innovation.',
        illustrations: [
          '/assets/sample_images/robot_ai.svg'
        ]
      }
    ]
  }
};
