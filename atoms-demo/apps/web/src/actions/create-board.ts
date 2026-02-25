"use server";

import { getServerSession } from "next-auth"; // v4 전용 함수
import { authOptions } from "../lib/auth";    // v4 설정 객체 가져오기
import { db } from "../lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const CreateBoard = z.object({
  title: z.string().min(3, {
    message: "제목은 최소 3글자 이상이어야 합니다.",
  }),
  image: z.string().optional(),
});

export async function createBoard(formData: FormData) {
  // [수정됨] v4 방식으로 세션 가져오기
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return {
      error: "로그인이 필요합니다.",
    };
  }

  const title = formData.get("title") as string;
  const image = formData.get("image") as string;

  const validatedFields = CreateBoard.safeParse({
    title,
    image,
  });

  if (!validatedFields.success) {
    return {
      error: "필수 입력값이 누락되었습니다.",
    };
  }

  let imageId, imageThumbUrl, imageFullUrl, imageLinkHtml, imageUserName;

  if (image) {
    [imageId, imageThumbUrl, imageFullUrl, imageLinkHtml, imageUserName] =
      image.split("|");
  }

  let board;

  try {
    board = await db.board.create({
      data: {
        title,
        ownerId: session.user.id, // 방법 B 적용
        imageId: imageId || undefined,
        imageThumbUrl: imageThumbUrl || undefined,
        imageFullUrl: imageFullUrl || undefined,
        imageLinkHtml: imageLinkHtml || undefined,
        imageUserName: imageUserName || undefined,
        columns: {
            create: [
                { title: "To Do", order: 1 },
                { title: "In Progress", order: 2 },
                { title: "Done", order: 3 },
            ]
        }
      },
    });

  } catch (error) {
    console.error("Failed to create board:", error);
    return {
      error: "데이터베이스 오류가 발생했습니다.",
    };
  }

  revalidatePath(`/board/${board.id}`);
  redirect(`/board/${board.id}`);
}
